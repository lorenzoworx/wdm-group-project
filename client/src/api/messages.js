// If you're running locally, set REACT_APP_API_BASE in .env
const BASE = process.env.REACT_APP_API_BASE || ''; // '' means same-origin (on UTA)

export async function getMessages() {
    const r = await fetch(`${BASE}/api/get_messages.php`, { credentials: 'omit' });
    if (!r.ok) throw new Error('Failed to load messages');
    return r.json();
}

export async function saveMessage({ name, email, body }) {
    const r = await fetch(`${BASE}/api/save_message.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({ name, email, body }),
    });
    if (!r.ok) {
        const text = await r.text().catch(() => '');
        throw new Error(text || 'Failed to save message');
    }
    return r.json();
}
