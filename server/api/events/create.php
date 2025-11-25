<?php
// 1) CORS FIRST (so preflight works even if DB fails)
require __DIR__ . '/../auth/_cors.php';

header('Content-Type: application/json');

// 2) DB next
require __DIR__ . '/../_bootstrap.php';

// 3) Parse body
$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if ($raw !== '' && json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}
$in = $in ?: [];

// 4) Authorization (Bearer token)
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

$st = $pdo->prepare("
  SELECT u.id, u.role
  FROM user_tokens t
  JOIN users u ON u.id = t.user_id
  WHERE t.token = ? AND (t.expires_at IS NULL OR t.expires_at > NOW())
");
$st->execute([$tok]);
$user = $st->fetch();
if (!$user) { http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit; }
if (!in_array($user['role'], ['admin','instructor'], true)) {
  http_response_code(403); echo json_encode(['error' => 'Not allowed']); exit;
}

// 5) Inputs
$title       = trim($in['title'] ?? '');
$eventDate   = trim($in['event_date'] ?? ($in['eventDate'] ?? ''));   // <-- fixed
$start       = trim($in['start_time'] ?? ($in['startTime'] ?? ''));
$end         = trim($in['end_time']   ?? ($in['endTime']   ?? ''));
$location    = trim($in['location'] ?? '');
$category    = trim($in['category'] ?? ($in['tag'] ?? ''));
$description = trim($in['description'] ?? '');

if ($title === '' || $eventDate === '') {
  http_response_code(400); echo json_encode(['error' => 'Missing required fields']); exit;
}

// 6) Insert
try {
  $sql = "INSERT INTO events
          (title, event_date, start_time, end_time, location, category, description, created_by, created_at)
          VALUES (?,?,?,?,?,?,?,?,NOW())";
  $st = $pdo->prepare($sql);
  $st->execute([$title, $eventDate, $start, $end, $location, $category, $description, (int)$user['id']]);
  $id = (int)$pdo->lastInsertId();
} catch (PDOException $e) {
  error_log('events/create.php DB error: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

// 7) OK
echo json_encode([
  'ok' => true,
  'event' => [
    'id'          => $id,
    'title'       => $title,
    'eventDate'   => $eventDate,
    'startTime'   => $start,
    'endTime'     => $end,
    'location'    => $location,
    'category'    => $category,
    'description' => $description
  ]
]);
