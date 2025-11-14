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
    console.debug('getEvents → GET', `${BASE}/api/events/list.php`);
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

    // Helpers to normalize dates/times for MySQL
    const toIsoDate = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
    const toTimeString = (d) => {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    };

    const parseDateValue = (val) => {
        if (!val && val !== 0) return null;
        if (val instanceof Date) return isNaN(val) ? null : toIsoDate(val);
        if (typeof val === 'number') return toIsoDate(new Date(val));
        if (typeof val === 'string') {
            // Try direct parse
            let dt = new Date(val);
            if (isNaN(dt)) {
                // Try appending current year for values like "Nov 23"
                const year = new Date().getFullYear();
                dt = new Date(`${val} ${year}`);
            }
            if (isNaN(dt)) return null;
            return toIsoDate(dt);
        }
        return null;
    };

    const parseTimeValue = (val) => {
        if (!val && val !== 0) return null;
        if (val instanceof Date) return toTimeString(val);
        if (typeof val === 'number') return toTimeString(new Date(val));
        if (typeof val === 'string') {
            // if string already looks like HH:MM or HH:MM:SS, try to normalize
            const m = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            if (m) {
                const hh = String(Number(m[1])).padStart(2, '0');
                const mm = m[2];
                const ss = m[3] ? m[3] : '00';
                return `${hh}:${mm}:${ss}`;
            }
            // try Date parse then extract time
            const dt = new Date(val);
            if (!isNaN(dt)) return toTimeString(dt);
            // try parsing '1:30 PM' style
            const dt2 = new Date(`1970-01-01 ${val}`);
            if (!isNaN(dt2)) return toTimeString(dt2);
            return null;
        }
        return null;
    };

    // Build payload copy and normalize fields expected by server
    const payloadCopy = { ...payload };

    // Map common camelCase keys (UI) to snake_case expected by some APIs
    if (payloadCopy.eventDate && !payloadCopy.event_date) {
      payloadCopy.event_date = payloadCopy.eventDate;
      delete payloadCopy.eventDate;
    }
    if (payloadCopy.startTime && !payloadCopy.start_time) {
      payloadCopy.start_time = payloadCopy.startTime;
      delete payloadCopy.startTime;
    }
    if (payloadCopy.endTime && !payloadCopy.end_time) {
      payloadCopy.end_time = payloadCopy.endTime;
      delete payloadCopy.endTime;
    }

    if (payloadCopy.event_date) {
        const iso = parseDateValue(payloadCopy.event_date);
        if (!iso) {
            throw new Error('Invalid event_date format — expected a date (e.g. 2025-11-23 or "Nov 23").');
        }
        payloadCopy.event_date = iso;
    }
    if (payloadCopy.start_time) {
        const t = parseTimeValue(payloadCopy.start_time);
        if (!t) {
            // allow empty/null, but if provided and invalid, throw
            throw new Error('Invalid start_time format — expected a time like "13:30" or a Date object.');
        }
        payloadCopy.start_time = t;
    }
    if (payloadCopy.end_time) {
        const t = parseTimeValue(payloadCopy.end_time);
        if (!t) {
            throw new Error('Invalid end_time format — expected a time like "15:00" or a Date object.');
        }
        payloadCopy.end_time = t;
    }

    const payloadWithToken = { ...payloadCopy, token };
    console.debug('createEvent → POST', `${BASE}/api/events/create.php`, payloadWithToken);
    try {
        const resp = await fetch(`${BASE}/api/events/create.php`, { method: 'POST', headers, body: JSON.stringify(payloadWithToken) });
        const body = await parseJson(resp);
        if (!resp.ok) {
            console.error('createEvent ← error', resp.status, body);
            throw new Error(body.error || `HTTP ${resp.status}`);
        }
        console.debug('createEvent ← success', body);
        return body;
    } catch (err) {
        console.error('createEvent → network/error', err);
        throw err;
    }
}

export async function updateEvent(payload) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader() };
    const payloadWithToken = { ...payload, token };
    console.debug('updateEvent → POST', `${BASE}/api/events/update.php`, payloadWithToken);
    try {
        const resp = await fetch(`${BASE}/api/events/update.php`, { method: 'POST', headers, body: JSON.stringify(payloadWithToken) });
        const body = await parseJson(resp);
        if (!resp.ok) {
            console.error('updateEvent ← error', resp.status, body);
            throw new Error(body.error || `HTTP ${resp.status}`);
        }
        console.debug('updateEvent ← success', body);
        return body;
    } catch (err) {
        console.error('updateEvent → network/error', err);
        throw err;
    }
}

export async function deleteEvent(id) {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) throw new Error('Not signed in');
    const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader() };
    const payload = { id, token };
    console.debug('deleteEvent → POST', `${BASE}/api/events/delete.php`, payload);
    try {
        const resp = await fetch(`${BASE}/api/events/delete.php`, { method: 'POST', headers, body: JSON.stringify(payload) });
        const body = await parseJson(resp);
        if (!resp.ok) {
            console.error('deleteEvent ← error', resp.status, body);
            throw new Error(body.error || `HTTP ${resp.status}`);
        }
        console.debug('deleteEvent ← success', body);
        return body;
    } catch (err) {
        console.error('deleteEvent → network/error', err);
        throw err;
    }
}
