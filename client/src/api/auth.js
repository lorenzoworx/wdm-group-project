
function determineBase() {
    if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return ''; // use CRA proxy
    }
    return 'https://bxp7143.uta.cloud';
}

const BASE = determineBase();

async function parseJson(resp) {
    const text = await resp.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error(text || `HTTP ${resp.status}`);
    }
}

export async function apiRegister({ name, email, password }) {
    const r = await fetch(`${BASE}/api/auth/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    const j = await parseJson(r);
    if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    return j; // { ok, token, user }
}

export async function apiLogin(email, password) {
    const r = await fetch(`${BASE}/api/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const j = await parseJson(r);
    if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    return j; // { ok:true, token, user:{...} }
}

export async function apiMe(token) {
    const r = await fetch(`${BASE}/api/auth/me.php`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const j = await parseJson(r);
    if (!r.ok) throw new Error(j.error || 'Not authenticated');
    return j;
}

export async function apiLogout(token) {
    await fetch(`${BASE}/api/auth/logout.php`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}
