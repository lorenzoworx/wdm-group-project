<?php
// server/api/announcements/create.php
// Create a new announcement (admin/instructor)
require __DIR__ . '/../auth/_cors.php';
header('Content-Type: application/json');
require __DIR__ . '/../../../db.php';

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if ($raw !== '' && json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}
$in = $in ?: [];

// Authorization
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
if (!$auth && function_exists('getallheaders')) {
  $all = getallheaders();
  if (isset($all['Authorization'])) $auth = $all['Authorization'];
  elseif (isset($all['authorization'])) $auth = $all['authorization'];
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

// Inputs
$title = trim($in['title'] ?? '');
$description = trim($in['description'] ?? '');
$department = trim($in['department'] ?? 'General');
$tags = $in['tags'] ?? [];
if (!is_array($tags)) {
  // accept comma string
  $tags = array_filter(array_map('trim', explode(',', (string)$tags)));
}
$isPinned = !empty($in['isPinned']) ? 1 : 0;

if ($title === '' || $description === '') {
  http_response_code(400); echo json_encode(['error' => 'Missing required fields']); exit;
}

try {
  $sql = "INSERT INTO announcements (title, description, department, tags, is_pinned, created_by, created_at) VALUES (?,?,?,?,?,?,NOW())";
  $st = $pdo->prepare($sql);
  $st->execute([$title, $description, $department, json_encode(array_values($tags)), $isPinned, (int)$user['id']]);
  $id = (int)$pdo->lastInsertId();
} catch (PDOException $e) {
  error_log('announcements/create.php DB error: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

echo json_encode(['ok' => true, 'announcement' => [
  'id' => $id,
  'title' => $title,
  'description' => $description,
  'department' => $department,
  'tags' => array_values($tags),
  'isPinned' => (bool)$isPinned,
  'createdBy' => $user['id']
]]);

