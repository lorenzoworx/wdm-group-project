import React, { useState, useEffect, useRef } from 'react';
import { getClasses } from '../api/classes';
import { getEvents } from '../api/events';
import { getExams } from '../api/exams';

const DEFAULT_MESSAGES = [
  { id: 1, from: 'bot', text: "Hi! I'm the course helper. Ask me about classes, exams, events, resources, announcements or your profile." },
];

/* -------------------- host/env helpers -------------------- */
function isLocalhostHost(h) {
  const x = (h || '').toLowerCase();
  return x === 'localhost' || x === '127.0.0.1';
}
function llmEndpoint() {
  try {
    const h = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
    if (isLocalhostHost(h)) return 'https://bxp7143.uta.cloud/api/chat/llm.php'; // call remote proxy from dev
    return '/api/chat/llm.php'; // same-origin in prod
  } catch {
    return '/api/chat/llm.php';
  }
}

/* -------------------- auth helpers -------------------- */
function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function getUserRole() {
  try {
    const t = localStorage.getItem('userType');
    if (t) return t;
    const u = getUserFromStorage();
    if (u && (u.userType || u.role)) return u.userType || u.role;
    return 'guest';
  } catch (e) {
    return 'guest';
  }
}

/* -------------------- simple NL matching -------------------- */
function normalizeText(s) {
  return String(s || '').toLowerCase();
}

function generateReply(text, role) {
  const t = normalizeText(text);
  const contains = (kw) => kw.some(k => t.includes(k));

  const isToday = contains(['today', 'tod']);
  const isTomorrow = contains(['tomorrow', 'tom']);
  const isThisWeek = contains(['this week', 'thisweek', 'week']);

  const perms = {
    admin: 'create, update and delete items (classes, exams, events, announcements)',
    instructor: 'create and update content (events, announcements, exams) and view/manage classes',
    student: 'view-only access to classes, exams, events, announcements and resources',
    guest: 'limited access; please log in to use the portal',
  };

  if (!t.trim()) return { text: "Please type a message or choose one of the suggestions below." };

  if (contains(['my classes', 'classes i have', 'my class', 'my schedule'])) {
    if (isToday) return { fetch: 'classes', timeframe: 'today' };
    if (isTomorrow) return { fetch: 'classes', timeframe: 'tomorrow' };
    if (isThisWeek) return { fetch: 'classes', timeframe: 'week' };
    return { fetch: 'classes', timeframe: 'all' };
  }

  if (contains(['my events', 'events i have', 'my event', 'events today', 'events this week', 'events'])) {
    if (isToday) return { fetch: 'events', timeframe: 'today' };
    if (isTomorrow) return { fetch: 'events', timeframe: 'tomorrow' };
    if (isThisWeek) return { fetch: 'events', timeframe: 'week' };
    return { fetch: 'events', timeframe: 'all' };
  }

  if (contains(['my exams', 'exams i have', 'my exam', 'exams today', 'exams this week', 'exam'])) {
    if (isToday) return { fetch: 'exams', timeframe: 'today' };
    if (isTomorrow) return { fetch: 'exams', timeframe: 'tomorrow' };
    if (isThisWeek) return { fetch: 'exams', timeframe: 'week' };
    return { fetch: 'exams', timeframe: 'all' };
  }

  if (contains(['who am i', 'whoami', 'profile'])) {
    const u = getUserFromStorage();
    if (u) return { text: `You are ${u.name || u.email} (role: ${role}).` };
    return { text: 'I cannot find your profile - you might not be logged in.' };
  }

  if (contains(['resource', 'pdf', 'download', 'view', 'open', 'resources'])) {
    return { text: 'Resources (PDFs, slides) are on the Resources page. Use Download to save, or View to open in a new tab (allow popups for direct Open).', action: '/resources' };
  }

  if (contains(['login', 'signup', 'logout', 'sign in', 'sign up'])) {
    return { text: 'Authentication happens via the Sign In / Sign Up screens. If you are having issues, ensure popups and cookies are allowed.' };
  }

  if (contains(['announce', 'announcement', 'announcements'])) {
    if (role === 'admin' || role === 'instructor') {
      return { text: 'You can create, update and pin announcements. Open the Announcements page to manage them.', action: '/announcements' };
    }
    return { text: 'Latest announcements are visible on the Announcements page and dashboard.', action: '/announcements' };
  }

  return {
    text: `I can help with classes, exams, events, announcements, resources and your profile. You are logged in as ${role} and have permissions: ${perms[role] || perms.guest}. Try: "Show my classes" or "Show my events today" (if permitted).`,
    suggestions: ['Show my classes', 'Show my events today', 'Show my exams this week', 'Who am I?']
  };
}

/* -------------------- date helpers -------------------- */
function parseIsoDate(val) {
  if (!val) return null;
  const cleaned = String(val).trim();
  const maybe = new Date(cleaned);
  if (!isNaN(maybe)) return maybe;
  const t2 = new Date(cleaned.replace(' ', 'T'));
  if (!isNaN(t2)) return t2;
  return null;
}
function startOfWeek(d) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0,0,0,0);
  return dt;
}
function endOfWeek(d) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23,59,59,999);
  return e;
}
function formatDateShort(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return String(d); }
}

/* -------------------- LLM proxy -------------------- */
async function callLLM(prompt, role = 'guest') {
  const endpoint = llmEndpoint();

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ prompt, role }),
    });

    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('text/html')) {
      const txt = await resp.text();
      throw new Error('Server returned HTML instead of JSON — possible rewrite to index.html or missing PHP endpoint. Response starts: ' + txt.slice(0, 200));
    }

    if (resp.ok) {
      const body = await resp.json();
      if (body && (body.text || body.result)) return body.text || body.result;
      throw new Error('Unexpected JSON from proxy');
    }
    throw new Error('Proxy error HTTP ' + resp.status);
  } catch (err) {
    // Optional fallback: direct OpenAI if configured
    const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
    if (!OPENAI_KEY) throw err;

    const body = {
      model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a university portal. Reply concisely.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.2,
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`OpenAI error: ${r.status} ${await r.text()}`);
    const j = await r.json();
    const text = j?.choices?.[0]?.message?.content ?? j?.choices?.[0]?.text;
    if (!text) throw new Error('OpenAI: unexpected response');
    return text.trim();
  }
}

/* -------------------- component -------------------- */
const ChatbotFloating = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    try {
      const s = sessionStorage.getItem('chat_messages');
      return s ? JSON.parse(s) : DEFAULT_MESSAGES;
    } catch (e) { return DEFAULT_MESSAGES; }
  });
  const [isTyping, setIsTyping] = useState(false);
  const role = getUserRole();
  const messagesRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('chat_messages', JSON.stringify(messages));
    const el = messagesRef.current;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }, [messages]);

  const pushMessage = (msg) => setMessages((m) => [...m, msg]);

  const handleSend = async (e) => {
    e && e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: 'user', text: trimmed };
    pushMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const reply = generateReply(trimmed, role);

    if (reply && reply.fetch) {
      try {
        if (reply.fetch === 'classes') {
          const res = await getClasses();
          const items = res.classes || [];
          let textOut = '';
          if (items.length === 0) {
            try {
              const ai = await callLLM(`User asked: "${trimmed}". No classes were found in DB. Based on role ${role}, provide helpful guidance and next steps.`, role);
              setIsTyping(false);
              pushMessage({ id: Date.now() + 1, from: 'bot', text: ai });
              return;
            } catch {}
          }
          if (reply.timeframe === 'today' || reply.timeframe === 'tomorrow' || reply.timeframe === 'week') {
            textOut = `I found ${items.length} classes. I can't reliably determine "this week" from freeform schedules; here are your classes with schedules:\n`;
            textOut += items.map(c => `${c.title || c.name || c.courseCode || c.course_code || 'Untitled'} — ${c.schedule || c.schedule_text || c.schedule || ''}`).join('\n');
          } else {
            textOut = `You have ${items.length} classes:\n` + items.map(c => `${c.title || c.name || c.courseCode || c.course_code || 'Untitled'} — ${c.schedule || ''}`).join('\n');
          }
          setIsTyping(false);
          pushMessage({ id: Date.now() + 1, from: 'bot', text: textOut });
          return;
        }

        if (reply.fetch === 'events') {
          const res = await getEvents();
          const items = res.events || [];
          const now = new Date();
          const startW = startOfWeek(now);
          const endW = endOfWeek(now);

          let filtered = items;
          if (reply.timeframe === 'today') {
            filtered = items.filter(it => {
              const d = parseIsoDate(it.event_date || it.date || it.start_date || it.start_time);
              if (!d) return false;
              const today = new Date(); today.setHours(0,0,0,0);
              const t2 = new Date(d); t2.setHours(0,0,0,0);
              return t2.getTime() === today.getTime();
            });
          } else if (reply.timeframe === 'week') {
            filtered = items.filter(it => {
              const d = parseIsoDate(it.event_date || it.date || it.start_time);
              if (!d) return false;
              return d >= startW && d <= endW;
            });
          }

          if (filtered.length === 0) {
            try {
              const ai = await callLLM(`User asked: "${trimmed}". No events were found in DB for timeframe ${reply.timeframe}. Provide helpful guidance and suggest actions.`, role);
              setIsTyping(false);
              pushMessage({ id: Date.now() + 1, from: 'bot', text: ai });
              return;
            } catch {}
          }

          let textOut;
          if (!filtered.length) textOut = 'No events found for the requested timeframe.';
          else textOut = `Found ${filtered.length} events:\n` + filtered.map(ev => `${ev.title || ev.name} — ${formatDateShort(ev.event_date || ev.start_time || ev.date)}`).join('\n');

          setIsTyping(false);
          pushMessage({ id: Date.now() + 1, from: 'bot', text: textOut });
          return;
        }

        if (reply.fetch === 'exams') {
          const res = await getExams();
          const items = res.exams || [];
          const now = new Date();
          const startW = startOfWeek(now);
          const endW = endOfWeek(now);

          let filtered = items;
          if (reply.timeframe === 'today') {
            filtered = items.filter(it => {
              const d = parseIsoDate(it.start_time || it.start || it.date);
              if (!d) return false;
              const today = new Date(); today.setHours(0,0,0,0);
              const t2 = new Date(d); t2.setHours(0,0,0,0);
              return t2.getTime() === today.getTime();
            });
          } else if (reply.timeframe === 'week') {
            filtered = items.filter(it => {
              const d = parseIsoDate(it.start_time || it.start || it.date);
              if (!d) return false;
              return d >= startW && d <= endW;
            });
          }

          if (filtered.length === 0) {
            try {
              const ai = await callLLM(`User asked: "${trimmed}". No exams found in DB for timeframe ${reply.timeframe}. Provide guidance and next steps.`, role);
              setIsTyping(false);
              pushMessage({ id: Date.now() + 1, from: 'bot', text: ai });
              return;
            } catch {}
          }

          let textOut;
          if (!filtered.length) textOut = 'No exams found for the requested timeframe.';
          else textOut = `Found ${filtered.length} exams:\n` + filtered.map(ex => `${ex.title || ex.name} — ${formatDateShort(ex.start_time || ex.start || ex.date)}`).join('\n');

          setIsTyping(false);
          pushMessage({ id: Date.now() + 1, from: 'bot', text: textOut });
          return;
        }
      } catch (err) {
        setIsTyping(false);
        pushMessage({ id: Date.now() + 1, from: 'bot', text: `Sorry, I couldn't fetch data: ${err.message || err}` });
        return;
      }
    }

    // Otherwise show regular reply (non-fetch)
    setTimeout(async () => {
      setIsTyping(false);
      if (reply) {
        if (reply.action) {
          pushMessage({ id: Date.now() + 1, from: 'bot', text: reply.text, meta: { action: reply.action } });
        } else if (reply.suggestions) {
          pushMessage({ id: Date.now() + 1, from: 'bot', text: reply.text, meta: { suggestions: reply.suggestions } });
          try {
            const ai = await callLLM(trimmed, role);
            pushMessage({ id: Date.now() + 2, from: 'bot', text: ai });
          } catch {}
        } else {
          pushMessage({ id: Date.now() + 1, from: 'bot', text: reply.text });
          try {
            const ai = await callLLM(trimmed, role);
            pushMessage({ id: Date.now() + 2, from: 'bot', text: ai });
          } catch {}
        }
      }
    }, 700 + Math.min(1500, trimmed.length * 20));
  };

  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => handleSend({ preventDefault: () => {} }), 80);
  };

  const handleActionOpen = (action) => {
    try {
      if (window && window.location) window.location.assign(action);
      else window.open(action, '_self');
    } catch (e) {
      window.open(action, '_self');
    }
  };

  return (
      <div className="fixed bottom-6 right-6 z-50">
        {open && (
            <div className="w-80 md:w-96 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden border" role="dialog" aria-label="Chatbot dialog">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.872L3 20l1.872-4.845A7.966 7.966 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold">Chatbot</span>
                  <span className="ml-2 text-sm opacity-80">{role !== 'guest' ? `(${role})` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setOpen(false); }} aria-label="Minimize chat" className="p-1 rounded-md hover:bg-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div ref={messagesRef} className="p-3 h-56 overflow-y-auto bg-gray-50">
                {messages.map((m) => (
                    <div key={m.id} className={`mb-3 flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${m.from === 'bot' ? 'bg-white border text-gray-800' : 'bg-blue-600 text-white'}`}>
                        <div>{m.text}</div>

                        {m.meta && m.meta.action && (
                            <div className="mt-2">
                              <button onClick={() => handleActionOpen(m.meta.action)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md">Open</button>
                            </div>
                        )}

                        {m.meta && Array.isArray(m.meta.suggestions) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {m.meta.suggestions.map((s) => (
                                  <button key={s} onClick={() => handleSuggestion(s)} className="text-xs px-2 py-1 bg-white border rounded-md hover:bg-gray-100">{s}</button>
                              ))}
                            </div>
                        )}
                      </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="mb-3 flex justify-start">
                      <div className="inline-block px-3 py-2 rounded-lg bg-white border text-gray-800">
                        typing...
                      </div>
                    </div>
                )}
              </div>

              <form onSubmit={handleSend} className="p-3 border-t bg-white flex gap-2">
                <input aria-label="Message input" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded-md text-sm" placeholder="Type a message..." />
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Send</button>
              </form>

              <div className="p-2 bg-gray-50 flex flex-wrap gap-2">
                {['Show my classes', 'Open Exams', 'Open Events', 'Open Resources', 'Who am I?'].map((s) => (
                    <button key={s} onClick={() => handleSuggestion(s)} className="text-xs px-2 py-1 bg-white border rounded-md hover:bg-gray-100">{s}</button>
                ))}
              </div>
            </div>
        )}

        {!open && (
            <button onClick={() => setOpen(true)} aria-label="Open chat" className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
        )}
      </div>
  );
};

export default ChatbotFloating;
