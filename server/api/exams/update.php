<?php
// server/api/exams/update.php
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

function mask_token_preview($s) {
  $s = (string)$s; if ($s === '') return '(empty)'; if (strlen($s) <= 10) return $s; return substr($s,0,6) . '...' . substr($s, -4);
}

if (!$tok) { http_response_code(401); echo json_encode(['error' => 'Missing token']); exit; }

$st = $pdo->prepare("SELECT u.id, u.role FROM user_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ? AND (t.expires_at IS NULL OR t.expires_at > NOW())");
$st->execute([$tok]);
$user = $st->fetch();
if (!$user) { error_log('exams/update.php: Invalid token attempt: ' . mask_token_preview($tok)); http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit; }
if (!in_array($user['role'], ['admin','instructor'], true)) { http_response_code(403); echo json_encode(['error' => 'Not allowed']); exit; }

$id = (int)($in['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(['error' => 'Missing exam id']); exit; }

// map incoming fields to DB columns
$title = trim($in['title'] ?? '');
$courseCode = trim($in['courseCode'] ?? ($in['course_code'] ?? ''));
$desc = trim($in['description'] ?? '');
$location = trim($in['location'] ?? '');
$duration = (int)($in['duration'] ?? ($in['duration_minutes'] ?? 0));
$start = trim($in['startTime'] ?? ($in['start_time'] ?? ''));
$end = trim($in['endTime'] ?? ($in['end_time'] ?? ''));
$maxStudents = (int)($in['maxStudents'] ?? ($in['max_students'] ?? 0));
$prereq = trim($in['prerequisites'] ?? ($in['prereq'] ?? ''));
$questions = $in['questions'] ?? [];

// minimal validation
if ($title === '' || $duration <= 0 || $start === '' || $end === '') {
  http_response_code(400); echo json_encode(['error' => 'Missing or invalid fields: title, duration, startTime and endTime are required']); exit;
}

// ensure exam exists
$check = $pdo->prepare("SELECT id FROM exams WHERE id = ?");
$check->execute([$id]);
$exists = $check->fetch();
if (!$exists) { http_response_code(404); echo json_encode(['error' => 'Exam not found']); exit; }

try {
  $sql = "UPDATE exams SET title = ?, course_code = ?, description = ?, location = ?, start_time = ?, end_time = ?, duration_minutes = ?, max_students = ?, prerequisites = ?, questions = ?, updated_at = NOW() WHERE id = ?";
  $st = $pdo->prepare($sql);
  $questionsJson = is_string($questions) ? $questions : json_encode($questions);
  $st->execute([$title, $courseCode, $desc, $location, $start, $end, $duration, $maxStudents, $prereq, $questionsJson, $id]);
} catch (PDOException $e) {
  error_log('exams/update.php: DB error updating exam: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']); exit;
}

$stmt = $pdo->prepare("SELECT id, title, course_code AS courseCode, description, location, duration_minutes AS duration, start_time AS startTime, end_time AS endTime, max_students AS maxStudents, current_students AS currentStudents, prerequisites, questions, created_by AS createdBy, created_at AS createdAt FROM exams WHERE id = ?");
$stmt->execute([$id]);
$updated = $stmt->fetch();
if (!$updated) { http_response_code(500); echo json_encode(['error' => 'Failed to fetch updated exam']); exit; }
$updated['questions'] = $updated['questions'] ? json_decode($updated['questions'], true) : [];

echo json_encode(['ok' => true, 'exam' => $updated]);
exit;

