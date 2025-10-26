import React, { useState } from 'react';

const ChatbotFloating = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: "Hi! I'm the course helper. How can I help?" },
  ]);

  const handleSend = (e) => {
    e && e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // demo reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: 'Thanks — this is a UI demo, not a working chatbot.',
        },
      ]);
    }, 700);
  };

  return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat panel */}
        {open && (
            <div className="w-80 md:w-96 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden border">
              {/* header bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
                <div className="flex items-center gap-2">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.872L3 20l1.872-4.845A7.966 7.966 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-semibold">Chatbot</span>
                </div>

                {/* close/minimize button */}
                <button
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="p-1 rounded-md hover:bg-blue-500/20"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* messages area */}
              <div className="p-3 h-56 overflow-y-auto bg-gray-50">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`mb-3 flex ${
                            m.from === 'bot' ? 'justify-start' : 'justify-end'
                        }`}
                    >
                      <div
                          className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${
                              m.from === 'bot'
                                  ? 'bg-white border text-gray-800'
                                  : 'bg-blue-600 text-white'
                          }`}
                      >
                        {m.text}
                      </div>
                    </div>
                ))}
              </div>

              {/* input row */}
              <form
                  onSubmit={handleSend}
                  className="p-3 border-t bg-white flex gap-2"
              >
                <input
                    aria-label="Message input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border rounded-md text-sm"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </div>
        )}

        {/* Floating toggle button (only when CLOSED) */}
        {!open && (
            <button
                onClick={() => setOpen(true)}
                aria-label="Open chat"
                className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
            >
              {/* chat icon */}
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h8m-8 4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
        )}
      </div>
  );
};

export default ChatbotFloating;
