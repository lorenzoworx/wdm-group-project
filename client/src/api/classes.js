// client/src/api/classes.js

// Decide API base: local dev -> '', otherwise use provided env or UTA host.
function determineBase() {
    if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return ''; // use CRA proxy
    }
    return 'https://bxp7143.uta.cloud';
}

const BASE = determineBase();

function authHeader() {
    const t = localStorage.getItem('userToken');
    if (!t) return {};

    // Normalize stored token: strip optional 'Bearer ' prefix and surrounding quotes/whitespace
    const token = String(t).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');

    if (process.env.NODE_ENV !== 'production') {
        const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;
        // eslint-disable-next-line no-console
        console.debug('authHeader → Authorization: Bearer %s', masked);
    }

    // Return Authorization and an extra header some servers/proxies accept
    return { Authorization: `Bearer ${token}`, 'X-Auth-Token': token };
}

async function parseJson(resp) {
    const text = await resp.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        // Bubble up plain-text PHP errors
        throw new Error(text || `HTTP ${resp.status}`);
    }
}

export async function getClasses() {
    // If your list endpoint is public, no need to send Authorization here.
    // Add "...authHeader()" to headers only if list.php is protected.
    const resp = await fetch(`${BASE}/api/classes/list.php`, {
        headers: { Accept: 'application/json' },
    });
    const body = await parseJson(resp);
    if (!resp.ok) throw new Error(body.error || 'Failed to load classes');
    return body; // { classes: [...] }
}

export async function createClass(payload) {
    // Require a token for creating classes
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');

    // Normalize token (match authHeader normalization)
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');

    // Quick local validation: server expects a 64-character hex token
    const isHex64 = /^[A-Fa-f0-9]{64}$/.test(token);
    if (!isHex64) {
        if (process.env.NODE_ENV !== 'production') {
            const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;
            // eslint-disable-next-line no-console
            console.debug('createClass → Stored token does not match expected 64-hex format; preview:', masked);
        }
        throw new Error('Invalid auth token format (expected 64-hex). Are you logged in with the backend?');
    }

    // include token in body as a fallback for servers that expect it in POST payload
    const payloadWithToken = {
        ...payload,
        token,
    };

    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeader(),
    };

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;
        console.debug('createClass → POST %s', `${BASE}/api/classes/create.php`);
        console.debug('createClass payload preview:', { ...payload, token: masked });
    }

    const resp = await fetch(`${BASE}/api/classes/create.php`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payloadWithToken),
    });

    const body = await parseJson(resp);
    if (!resp.ok) {
        // eslint-disable-next-line no-console
        console.debug('createClass ← %s', resp.status, body);
        throw new Error(body.error || `HTTP ${resp.status}`);
    }
    return body; // { ok: true, class: {...} }
}

export async function updateClass(payload) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeader(),
    };
    const payloadWithToken = { ...payload, token };
    if (process.env.NODE_ENV !== 'production') {
        const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;
        console.debug('updateClass → POST %s', `${BASE}/api/classes/update.php`);
        console.debug('updateClass payload preview:', { ...payload, token: masked });
    }
    const resp = await fetch(`${BASE}/api/classes/update.php`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payloadWithToken),
    });
    const body = await parseJson(resp);
    if (!resp.ok) {
        // eslint-disable-next-line no-console
        console.debug('updateClass ← %s', resp.status, body);
        throw new Error(body.error || `HTTP ${resp.status}`);
    }
    return body; // { ok: true, class: {...} }
}

export async function deleteClass(id) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeader(),
    };
    const payload = { id, token };

    if (process.env.NODE_ENV !== 'production') {
        const masked = token.length > 10 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;
        console.debug('deleteClass → POST %s', `${BASE}/api/classes/delete.php`);
        console.debug('deleteClass payload preview:', { id, token: masked });
    }

    const resp = await fetch(`${BASE}/api/classes/delete.php`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const body = await parseJson(resp);
    if (!resp.ok) {
        // eslint-disable-next-line no-console
        console.debug('deleteClass ← %s', resp.status, body);
        throw new Error(body.error || `HTTP ${resp.status}`);
    }
    return body; // { ok: true, id }
}
