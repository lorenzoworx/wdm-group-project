/* jshint esversion: 11 */   // allow ES6+ (export, let/const, etc.)
/* jshint -W033 */           // silence “Missing ;” noise from old rules
/* global fetch, localStorage, window, process */

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
  var rawToken = localStorage.getItem('userToken') || '';
  var token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');

  // Build headers with token if we have one; otherwise send without and let server 401
  var headers = Object.assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, {});
  if (token) headers = Object.assign(headers, { Authorization: 'Bearer ' + token, 'X-Auth-Token': token });

  var body = Object.assign({}, payload, token ? { token: token } : {});

  return fetch(BASE + '/api/announcements/create.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  }).then(function (resp) {
    return parseJson(resp).then(function (parsed) {
      if (!resp.ok) throw new Error(parsed.error || ('HTTP ' + resp.status));
      return parsed; // { announcement: {...} }
    });
  });
}

export function updateAnnouncement(payload) {
  var rawToken = localStorage.getItem('userToken') || '';
  var token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  var headers = Object.assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, {});
  if (token) headers = Object.assign(headers, { Authorization: 'Bearer ' + token, 'X-Auth-Token': token });
  var body = Object.assign({}, payload, token ? { token: token } : {});

  return fetch(BASE + '/api/announcements/update.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  }).then(function (resp) {
    return parseJson(resp).then(function (parsed) {
      if (!resp.ok) throw new Error(parsed.error || ('HTTP ' + resp.status));
      return parsed;
    });
  });
}

export function deleteAnnouncement(id) {
  var rawToken = localStorage.getItem('userToken') || '';
  var token = String(rawToken).replace(/^\s*Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  var headers = Object.assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, {});
  if (token) headers = Object.assign(headers, { Authorization: 'Bearer ' + token, 'X-Auth-Token': token });
  var body = { id: id };
  if (token) body.token = token;

  return fetch(BASE + '/api/announcements/delete.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  }).then(function (resp) {
    return parseJson(resp).then(function (parsed) {
      if (!resp.ok) throw new Error(parsed.error || ('HTTP ' + resp.status));
      return parsed;
    });
  });
}
