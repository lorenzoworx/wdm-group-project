<?php
require __DIR__ . '/../../../db.php';
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

// auth extraction (same as create.php)
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

function mask_token_preview($s) {
  $s = (string)$s; if ($s === '') return '(empty)'; if (strlen($s) <= 10) return $s; return substr($s,0,6) . '...' . substr($s, -4);
}

if (!$tok) {
  $ga = function_exists('getallheaders') ? getallheaders() : [];
  $gaAuth = $ga['Authorization'] ?? ($ga['authorization'] ?? null);
  error_log("update.php: Missing token. HTTP_AUTHORIZATION=" . var_export($_SERVER['HTTP_AUTHORIZATION'] ?? null, true) . ", REDIRECT_HTTP_AUTHORIZATION=" . var_export($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null, true) . ", getallheaders Authorization=" . var_export($gaAuth, true) . ", auth_preview=" . mask_token_preview($auth ?? '') );
  http_response_code(401); echo json_encode(['error' => 'Missing token']); exit;
}

$st = $pdo->prepare("SELECT u.id, u.role FROM user_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ? AND (t.expires_at IS NULL OR t.expires_at > NOW())");
$st->execute([$tok]);
$user = $st->fetch();
if (!$user) { error_log('update.php: Invalid token attempt: ' . mask_token_preview($tok)); http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit; }
if (!in_array($user['role'], ['admin','instructor'], true)) { http_response_code(403); echo json_encode(['error' => 'Not allowed']); exit; }

// required fields
$id = (int)($in['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(['error' => 'Missing class id']); exit; }

$title  = trim($in['title'] ?? '');
$code   = trim($in['courseCode'] ?? '');
$desc   = trim($in['description'] ?? '');
$instr  = trim($in['instructor'] ?? '');
$sched  = trim($in['schedule'] ?? '');
$loc    = trim($in['location'] ?? '');
$max    = (int)($in['maxStudents'] ?? 0);
$prereq = trim($in['prerequisites'] ?? '');

if ($title==='' || $code==='' || $instr==='' || $sched==='' || $loc==='' || $max<=0) {
  http_response_code(400); echo json_encode(['error'=>'Missing or invalid fields']); exit;
}

// ensure class exists
$check = $pdo->prepare("SELECT id FROM classes WHERE id = ?");
$check->execute([$id]);
$exists = $check->fetch();
if (!$exists) { http_response_code(404); echo json_encode(['error' => 'Class not found']); exit; }

// update
$sql = "UPDATE classes SET title = ?, course_code = ?, description = ?, instructor = ?, schedule = ?, location = ?, max_students = ?, prerequisites = ? WHERE id = ?";
try {
  $st = $pdo->prepare($sql);
  $st->execute([$title, $code, $desc, $instr, $sched, $loc, $max, $prereq, $id]);
} catch (PDOException $e) {
  error_log('update.php: DB error updating class: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

// return updated row
$stmt = $pdo->prepare("SELECT id, title, course_code AS courseCode, description, instructor, schedule, location, max_students AS maxStudents, current_students AS currentStudents, prerequisites FROM classes WHERE id = ?");
$stmt->execute([$id]);
$updated = $stmt->fetch();
if (!$updated) { http_response_code(500); echo json_encode(['error' => 'Failed to fetch updated class']); exit; }

echo json_encode(['ok' => true, 'class' => $updated]);

