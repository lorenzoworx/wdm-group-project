// client/src/api/announcements.js

function determineBase() {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }
  if (typeof window !== 'undefined') {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
  }
  return 'https://bxp7143.uta.cloud';
}
var BASE = determineBase();

// 64-hex token validator (server style)
function isValidServerToken(t) {
  if (!t) return false;
  return /^[A-Fa-f0-9]{64}$/.test(String(t).trim().replace(/^"|"$/g, ''));
}

// Build Authorization header from localStorage token
function authHeader() {
  var t = localStorage.getItem('userToken');
  if (!t) return {};
  var token = String(t).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  return { Authorization: 'Bearer ' + token, 'X-Auth-Token': token };
}

// Safe JSON parse. Never throws; returns {} on invalid JSON.
async function parseJson(resp) {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return {};
  }
}

export async function getAnnouncements() {
  const resp = await fetch(BASE + '/api/announcements/list.php', {
    headers: { Accept: 'application/json' }
  });
  const body = await parseJson(resp);
  if (!resp.ok) throw new Error(body.error || 'Failed to load announcements');
  return body; // { announcements: [...] }
}

export async function createAnnouncement(payload) {
  const rawToken = localStorage.getItem('userToken');
  if (!rawToken) throw new Error('Not signed in');

  const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  if (!isValidServerToken(token)) {
    throw new Error('Invalid token. Please sign out and sign in again.');
  }

  const headers = Object.assign(
      { 'Content-Type': 'application/json', Accept: 'application/json' },
      authHeader()
  );
  const payloadWithToken = Object.assign({}, payload, { token: token });

  const resp = await fetch(BASE + '/api/announcements/create.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payloadWithToken)
  });
  const body = await parseJson(resp);
  if (!resp.ok) throw new Error(body.error || 'HTTP ' + resp.status);
  return body; // { announcement: {...} }
}

export async function updateAnnouncement(payload) {
  const rawToken = localStorage.getItem('userToken');
  if (!rawToken) throw new Error('Not signed in');

  const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  if (!isValidServerToken(token)) {
    throw new Error('Invalid token. Please sign out and sign in again.');
  }

  const headers = Object.assign(
      { 'Content-Type': 'application/json', Accept: 'application/json' },
      authHeader()
  );
  const payloadWithToken = Object.assign({}, payload, { token: token });

  const resp = await fetch(BASE + '/api/announcements/update.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payloadWithToken)
  });
  const body = await parseJson(resp);
  if (!resp.ok) throw new Error(body.error || 'HTTP ' + resp.status);
  return body;
}

export async function deleteAnnouncement(id) {
  const rawToken = localStorage.getItem('userToken');
  if (!rawToken) throw new Error('Not signed in');

  const token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  if (!isValidServerToken(token)) {
    throw new Error('Invalid token. Please sign out and sign in again.');
  }

  const headers = Object.assign(
      { 'Content-Type': 'application/json', Accept: 'application/json' },
      authHeader()
  );
  const payload = { id: id, token: token };

  const resp = await fetch(BASE + '/api/announcements/delete.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });
  const body = await parseJson(resp);
  if (!resp.ok) throw new Error(body.error || 'HTTP ' + resp.status);
  return body;
}
