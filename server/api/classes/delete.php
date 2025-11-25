<?php
require_once __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../db.php';
header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if ($raw !== '' && json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}
$in = $in ?: [];

// auth extraction
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
  $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}
if (!$auth && function_exists('getallheaders')) {
  $all = getallheaders();
  if (isset($all['Authorization']))       $auth = $all['Authorization'];
  elseif (isset($all['authorization']))   $auth = $all['authorization'];
}

$tok = null;
if ($auth && preg_match('/Bearer\s+([A-Fa-f0-9]{64})/i', $auth, $m)) {
  $tok = $m[1];
} elseif (!empty($in['token']) && preg_match('/^[A-Fa-f0-9]{64}$/', $in['token'])) {
  $tok = $in['token'];
}

function mask_token_preview($s) { $s = (string)$s; if ($s === '') return '(empty)'; if (strlen($s) <= 10) return $s; return substr($s,0,6) . '...' . substr($s, -4); }

if (!$tok) {
  $ga = function_exists('getallheaders') ? getallheaders() : [];
  $gaAuth = $ga['Authorization'] ?? ($ga['authorization'] ?? null);
  error_log("delete.php: Missing token. HTTP_AUTHORIZATION=" . var_export($_SERVER['HTTP_AUTHORIZATION'] ?? null, true) . ", REDIRECT_HTTP_AUTHORIZATION=" . var_export($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null, true) . ", getallheaders Authorization=" . var_export($gaAuth, true));
  http_response_code(401); echo json_encode(['error' => 'Missing token']); exit;
}

$st = $pdo->prepare("SELECT u.id, u.role FROM user_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ? AND (t.expires_at IS NULL OR t.expires_at > NOW())");
$st->execute([$tok]);
$user = $st->fetch();
if (!$user) { error_log('delete.php: Invalid token attempt: ' . mask_token_preview($tok)); http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit; }
if (!in_array($user['role'], ['admin','instructor'], true)) { http_response_code(403); echo json_encode(['error' => 'Not allowed']); exit; }

$id = (int)($in['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(['error' => 'Missing class id']); exit; }

// ensure class exists
$check = $pdo->prepare("SELECT id FROM classes WHERE id = ?");
$check->execute([$id]);
$exists = $check->fetch();
if (!$exists) { http_response_code(404); echo json_encode(['error' => 'Class not found']); exit; }

try {
  $del = $pdo->prepare("DELETE FROM classes WHERE id = ?");
  $del->execute([$id]);
} catch (PDOException $e) {
  error_log('delete.php: DB error deleting class: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

echo json_encode(['ok' => true, 'id' => $id]);

