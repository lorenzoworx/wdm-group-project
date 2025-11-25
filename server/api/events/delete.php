<?php
require_once __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth/_cors.php';
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

if (!$tok) { http_response_code(401); echo json_encode(['error' => 'Missing token']); exit; }

$st = $pdo->prepare("SELECT u.id, u.role FROM user_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ? AND (t.expires_at IS NULL OR t.expires_at > NOW())");
$st->execute([$tok]);
$user = $st->fetch();
if (!$user) { http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit; }
if (!in_array($user['role'], ['admin','instructor'], true)) { http_response_code(403); echo json_encode(['error' => 'Not allowed']); exit; }

$id = (int)($in['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(['error' => 'Missing event id']); exit; }

// ensure exists
$check = $pdo->prepare("SELECT id FROM events WHERE id = ?");
$check->execute([$id]);
$exists = $check->fetch();
if (!$exists) { http_response_code(404); echo json_encode(['error' => 'Event not found']); exit; }

try {
  $st = $pdo->prepare("DELETE FROM events WHERE id = ?");
  $st->execute([$id]);
} catch (PDOException $e) {
  error_log('events/delete.php DB error: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

echo json_encode(['ok' => true, 'id' => $id]);
exit;
