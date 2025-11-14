// client/src/api/events.js
function determineBase() {
    if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return '';
    }
    return 'https://bxp7143.uta.cloud';
}

const BASE = determineBase();

function authHeader() {
    const t = localStorage.getItem('userToken');
    if (!t) return {};
    const token = String(t).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    return { Authorization: `Bearer ${token}`, 'X-Auth-Token': token };
}

async function parseJson(resp) {
    const text = await resp.text();
    try { return text ? JSON.parse(text) : {}; } catch { throw new Error(text || `HTTP ${resp.status}`); }
}

export async function getEvents() {
    const resp = await fetch(`${BASE}/api/events/list.php`, { headers: { Accept: 'application/json' } });
    const body = await parseJson(resp);
    if (!resp.ok) throw new Error(body.error || 'Failed to load events');
    return body; // { events: [...] }
}

export async function createEvent(payload) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader() };
    const payloadWithToken = { ...payload, token };
    const resp = await fetch(`${BASE}/api/events/create.php`, { method: 'POST', headers, body: JSON.stringify(payloadWithToken) });
    const body = await parseJson(resp);
    if (!resp.ok) throw new Error(body.error || `HTTP ${resp.status}`);
    return body;
}

export async function updateEvent(payload) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader() };
    const payloadWithToken = { ...payload, token };
    const resp = await fetch(`${BASE}/api/events/update.php`, { method: 'POST', headers, body: JSON.stringify(payloadWithToken) });
    const body = await parseJson(resp);
    if (!resp.ok) throw new Error(body.error || `HTTP ${resp.status}`);
    return body;
}

export async function deleteEvent(id) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader() };
    const payload = { id, token };
    const resp = await fetch(`${BASE}/api/events/delete.php`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const body = await parseJson(resp);
    if (!resp.ok) throw new Error(body.error || `HTTP ${resp.status}`);
    return body;
}

