<?php
// server/api/announcements/update.php
// Update an announcement (admin/instructor)
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

// Authorization (same pattern)
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

$id = (int)($in['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing id']); exit; }

$title = trim($in['title'] ?? '');
$description = trim($in['description'] ?? '');
$department = trim($in['department'] ?? 'General');
$tags = $in['tags'] ?? [];
if (!is_array($tags)) $tags = array_filter(array_map('trim', explode(',', (string)$tags)));
$isPinned = !empty($in['isPinned']) ? 1 : 0;

try {
  $sql = "UPDATE announcements SET title = ?, description = ?, department = ?, tags = ?, is_pinned = ?, updated_at = NOW() WHERE id = ?";
  $st = $pdo->prepare($sql);
  $st->execute([$title, $description, $department, json_encode(array_values($tags)), $isPinned, $id]);
} catch (PDOException $e) {
  error_log('announcements/update.php DB error: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

echo json_encode(['ok' => true, 'announcement' => [
  'id' => $id,
  'title' => $title,
  'description' => $description,
  'department' => $department,
  'tags' => array_values($tags),
  'isPinned' => (bool)$isPinned
]]);
