<?php
require __DIR__ . '/../../../db.php';
require __DIR__ . '/../auth/_cors.php';
header('Content-Type: application/json');

// Return list of exams. This endpoint is public (no auth required).
try {
  $st = $pdo->prepare("SELECT id, title, course_code AS courseCode, description, location, duration_minutes AS duration, start_time AS startTime, end_time AS endTime, max_students AS maxStudents, current_students AS currentStudents, prerequisites, questions, created_by AS createdBy, created_at AS createdAt FROM exams ORDER BY id DESC");
  $st->execute();
  $rows = $st->fetchAll();
  // decode questions JSON/text for each row
  $exams = array_map(function($r) {
    if (!empty($r['questions'])) {
      $decoded = json_decode($r['questions'], true);
      $r['questions'] = ($decoded !== null) ? $decoded : $r['questions'];
    } else {
      $r['questions'] = [];
    }
    // map duration to integer
    $r['duration'] = isset($r['duration']) ? (int)$r['duration'] : 0;
    return $r;
  }, $rows);
  echo json_encode(['exams' => $exams]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
}
exit;
