// client/src/api/announcements.js
/* jshint esversion: 5 */
/* jshint -W033 */

// Base URL: prefer env var, else localhost empty base, else production
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

// 64-hex token validator
function isValidServerToken(t) {
  if (!t) return false;
  return (/^[A-Fa-f0-9]{64}$/).test(String(t).trim().replace(/^"|"$/g, ''));
}

// Build Authorization header from localStorage token
function authHeader() {
  var t = localStorage.getItem('userToken');
  if (!t) return {};
  var token = String(t).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  return { Authorization: 'Bearer ' + token, 'X-Auth-Token': token };
}

// Safe JSON parse (never throws)
function parseJson(resp) {
  return resp.text().then(function (text) {
    try { return text ? JSON.parse(text) : {}; }
    catch (e) { return {}; }
  });
}

export function getAnnouncements() {
  return fetch(BASE + '/api/announcements/list.php', {
    headers: { Accept: 'application/json' }
  }).then(function (resp) {
    return parseJson(resp).then(function (body) {
      if (!resp.ok) throw new Error(body.error || 'Failed to load announcements');
      return body; // { announcements: [...] }
    });
  });
}

export function createAnnouncement(payload) {
  var rawToken = localStorage.getItem('userToken');
  if (!rawToken) return Promise.reject(new Error('Not signed in'));

  var token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  if (!isValidServerToken(token)) {
    return Promise.reject(new Error('Invalid token. Please sign out and sign in again.'));
  }

  var headers = Object.assign(
      { 'Content-Type': 'application/json', Accept: 'application/json' },
      authHeader()
  );
  var payloadWithToken = Object.assign({}, payload, { token: token });

  return fetch(BASE + '/api/announcements/create.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payloadWithToken)
  }).then(function (resp) {
    return parseJson(resp).then(function (body) {
      if (!resp.ok) throw new Error(body.error || ('HTTP ' + resp.status));
      return body; // { announcement: {...} }
    });
  });
}

export function updateAnnouncement(payload) {
  var rawToken = localStorage.getItem('userToken');
  if (!rawToken) return Promise.reject(new Error('Not signed in'));

  var token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  if (!isValidServerToken(token)) {
    return Promise.reject(new Error('Invalid token. Please sign out and sign in again.'));
  }

  var headers = Object.assign(
      { 'Content-Type': 'application/json', Accept: 'application/json' },
      authHeader()
  );
  var payloadWithToken = Object.assign({}, payload, { token: token });

  return fetch(BASE + '/api/announcements/update.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payloadWithToken)
  }).then(function (resp) {
    return parseJson(resp).then(function (body) {
      if (!resp.ok) throw new Error(body.error || ('HTTP ' + resp.status));
      return body;
    });
  });
}

export function deleteAnnouncement(id) {
  var rawToken = localStorage.getItem('userToken');
  if (!rawToken) return Promise.reject(new Error('Not signed in'));

  var token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  if (!isValidServerToken(token)) {
    return Promise.reject(new Error('Invalid token. Please sign out and sign in again.'));
  }

  var headers = Object.assign(
      { 'Content-Type': 'application/json', Accept: 'application/json' },
      authHeader()
  );
  var payload = { id: id, token: token };

  return fetch(BASE + '/api/announcements/delete.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  }).then(function (resp) {
    return parseJson(resp).then(function (body) {
      if (!resp.ok) throw new Error(body.error || ('HTTP ' + resp.status));
      return body;
    });
  });
}
