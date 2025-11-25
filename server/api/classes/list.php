<?php
global $pdo;
require __DIR__ . '/../_cors.php';                     // 1) CORS headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {        // 2) Preflight exits early
    http_response_code(204);
    exit;
}
require __DIR__ . '/../db.php';                        // 3) Connect AFTER preflight
header('Content-Type: application/json');              // 4) JSON by default

$stmt = $pdo->query("SELECT id, title, course_code AS courseCode, description,
                            instructor, schedule, location,
                            max_students AS maxStudents,
                            current_students AS currentStudents,
                            prerequisites, created_at
                     FROM classes
                     ORDER BY id DESC");
echo json_encode($stmt->fetchAll());
