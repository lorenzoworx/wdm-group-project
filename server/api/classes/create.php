<?php
require __DIR__ . '/../../../db.php';
require __DIR__ . '/../auth/_cors.php';
header('Content-Type: application/json');

/* --- read raw body ONCE so we can reuse it --- */
$raw = file_get_contents('php://input');
$in  = json_decode($raw, true);
if ($raw !== '' && json_last_error() !== JSON_ERROR_NONE) {
  // invalid JSON sent by client
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}
$in = $in ?: [];

/* --- pull Authorization from several sources (Apache/FPM/CGI differences) --- */
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
  $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}
if (!$auth && function_exists('getallheaders')) {
  $all = getallheaders();
  if (isset($all['Authorization']))       $auth = $all['Authorization'];
  elseif (isset($all['authorization']))   $auth = $all['authorization'];
}

/* --- extract 64-hex token from "Bearer <token>" OR accept token in body --- */
$tok = null;
if ($auth && preg_match('/Bearer\s+([A-Fa-f0-9]{64})/i', $auth, $m)) {
  $tok = $m[1];
} elseif (!empty($in['token']) && preg_match('/^[A-Fa-f0-9]{64}$/', $in['token'])) {
  // body fallback (useful when servers strip Authorization)
  $tok = $in['token'];
}

// Helper to produce a masked preview for logging (avoid exposing full token in logs)
function mask_token_preview($s) {
  $s = (string)$s;
  if ($s === '') return '(empty)';
  if (strlen($s) <= 10) return $s;
  return substr($s,0,6) . '...' . substr($s, -4);
}

if (!$tok) {
  // Log diagnostic info to help devs understand where header came from and what was sent
  $previewAuth = mask_token_preview($auth ?? '');
  $previewBodyToken = mask_token_preview($in['token'] ?? '');
  // Avoid calling getallheaders() multiple times in the log expression
  $ga = function_exists('getallheaders') ? getallheaders() : [];
  $gaAuth = $ga['Authorization'] ?? ($ga['authorization'] ?? null);
  error_log("create.php: Missing token. HTTP_AUTHORIZATION=" . var_export($_SERVER['HTTP_AUTHORIZATION'] ?? null, true) . ", REDIRECT_HTTP_AUTHORIZATION=" . var_export($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null, true) . ", getallheaders Authorization=" . var_export($gaAuth, true) . ", auth_preview={$previewAuth}, body_token_preview={$previewBodyToken}, raw_body_snippet=" . substr((string)$raw,0,200));
  http_response_code(401); echo json_encode(['error' => 'Missing token']); exit; }

/* --- validate token -> user --- */
$st = $pdo->prepare("
  SELECT u.id, u.role
  FROM user_tokens t
  JOIN users u ON u.id = t.user_id
  WHERE t.token = ? AND (t.expires_at IS NULL OR t.expires_at > NOW())
");
$st->execute([$tok]);
$user = $st->fetch();
if (!$user) {
  // token present but invalid -> log masked token preview
  error_log('create.php: Invalid token attempt: ' . mask_token_preview($tok));
  http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit; }
if (!in_array($user['role'], ['admin','instructor'], true)) {
  http_response_code(403); echo json_encode(['error' => 'Not allowed']); exit;
}

/* --- input fields --- */
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

/* --- insert into classes (table name is "classes") --- */
$sql = "INSERT INTO classes
        (title, course_code, description, instructor, schedule, location,
         max_students, current_students, prerequisites, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?)";
try {
  $st = $pdo->prepare($sql);
  $st->execute([
    $title, $code, $desc, $instr, $sched, $loc, $max, 0, $prereq, (int)$user['id']
  ]);
  $id = (int)$pdo->lastInsertId();
} catch (PDOException $e) {
  error_log('create.php: DB error creating class: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
  exit;
}

/* --- return the new row --- */
echo json_encode([
  'ok' => true,
  'class' => [
    'id' => $id,
    'title' => $title,
    'courseCode' => $code,
    'description' => $desc,
    'instructor' => $instr,
    'schedule' => $sched,
    'location' => $loc,
    'maxStudents' => $max,
    'currentStudents' => 0,
    'prerequisites' => $prereq,
  ],
]);

// ensure no further output
exit;
