<?php
require __DIR__ . '/../db.php';
require __DIR__ . '/../_cors.php';
header('Content-Type: application/json');

// Read raw body once
$rawBody = file_get_contents('php://input');
// Try JSON decode first
$decoded = json_decode($rawBody, true);
if (is_array($decoded)) {
  $data = $decoded;
} elseif (!empty($_POST)) {
  // fallback to PHP-populated $_POST (form-encoded or multipart)
  $data = $_POST;
} else {
  // last-resort: parse query-style body e.g. "email=...&password=..."
  $parsed = [];
  parse_str($rawBody, $parsed);
  $data = is_array($parsed) ? $parsed : [];
}

// Extract raw values (may be scalar or array). Avoid calling trim() until we coerce to string.
$rawEmail = $data['email'] ?? '';
$rawPass  = $data['password'] ?? '';

// If inputs arrived as arrays (e.g., multiple form fields), coerce to first element
if (is_array($rawEmail)) {
  $rawEmail = reset($rawEmail) ?: '';
}
if (is_array($rawPass)) {
  $rawPass = reset($rawPass) ?: '';
}

// Final safety: ensure scalar
if (!is_scalar($rawEmail) || !is_scalar($rawPass)) {
  // Log limited debug info without exposing passwords
  $headers = [];
  foreach (array('HTTP_ORIGIN','CONTENT_TYPE','REQUEST_METHOD') as $k) {
    if (isset($_SERVER[$k])) $headers[$k] = $_SERVER[$k];
  }
  error_log('login.php: invalid input types for email/password. headers=' . json_encode($headers) . ' raw_body_preview=' . substr($rawBody,0,200));
  http_response_code(400);
  echo json_encode(['error' => 'Invalid request data']);
  exit;
}

// Normalize email to lowercase to avoid case-sensitivity issues
$email = strtolower(trim((string)$rawEmail));
$pass  = (string)$rawPass;

// Basic validation
if ($email === '' || $pass === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Email and password are required']);
  exit;
}

// Lookup user (case-insensitive by using LOWER(email) = ?)
$st = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE LOWER(email) = ?');
$st->execute([$email]);
$u = $st->fetch();

if (!$u) {
  error_log('login.php: login failed - user not found for email: ' . $email);
  http_response_code(401);
  echo json_encode(['error' => 'Invalid credentials']);
  exit;
}

if (!password_verify($pass, $u['password_hash'])) {
  // Log failed verify attempt (masked)
  error_log(sprintf('login.php: invalid password attempt for user_id=%d email=%s', $u['id'], $email));
  http_response_code(401);
  echo json_encode(['error' => 'Invalid credentials']);
  exit;
}

// ---- Session policy: SINGLE ACTIVE SESSION PER USER ----
// 1) Prune expired tokens (any user)
$pdo->exec("DELETE FROM user_tokens WHERE expires_at IS NOT NULL AND expires_at <= NOW()");

// 2) Revoke ALL existing tokens for this user (so a new login invalidates old sessions)
$del = $pdo->prepare('DELETE FROM user_tokens WHERE user_id = ?');
$del->execute([$u['id']]);

// 3) Issue a fresh token (valid 7 days)
$token = bin2hex(random_bytes(32));
$exp   = date('Y-m-d H:i:s', time() + 60*60*24*7);

$ins = $pdo->prepare('INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
$ins->execute([$u['id'], $token, $exp]);

echo json_encode([
  'ok'    => true,
  'token' => $token,
  'user'  => [
    'id'    => (int)$u['id'],
    'name'  => $u['name'],
    'email' => $u['email'],
    'role'  => $u['role'],
  ],
]);
