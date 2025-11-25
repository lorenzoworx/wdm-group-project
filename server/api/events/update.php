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

// map fields
$title = trim($in['title'] ?? '');
$eventDate = trim($in['event_date'] ?? ($in['eventDate'] ?? ''));
$start = trim($in['start_time'] ?? ($in['startTime'] ?? ''));
$end = trim($in['end_time'] ?? ($in['endTime'] ?? ''));
$location = trim($in['location'] ?? '');
$category = trim($in['category'] ?? ($in['tag'] ?? ''));
$description = trim($in['description'] ?? '');

if ($title === '' || $eventDate === '') {
  http_response_code(400); echo json_encode(['error' => 'Missing required fields']); exit;
}

// ensure exists
$check = $pdo->prepare("SELECT id FROM events WHERE id = ?");
$check->execute([$id]);
$exists = $check->fetch();
if (!$exists) { http_response_code(404); echo json_encode(['error' => 'Event not found']); exit; }

try {
  $sql = "UPDATE events SET title = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, category = ?, description = ? WHERE id = ?";
  $st = $pdo->prepare($sql);
  $st->execute([$title, $eventDate, $start, $end, $location, $category, $description, $id]);
} catch (PDOException $e) {
  error_log('events/update.php DB error: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

$stmt = $pdo->prepare("SELECT id, title, event_date AS eventDate, start_time AS startTime, end_time AS endTime, location, category, description, created_by AS createdBy, created_at AS createdAt FROM events WHERE id = ?");
$stmt->execute([$id]);
$updated = $stmt->fetch();
if (!$updated) { http_response_code(500); echo json_encode(['error' => 'Failed to fetch updated event']); exit; }

echo json_encode(['ok' => true, 'event' => $updated]);
exit;
