<?php
require __DIR__ . '/../db.php';
require __DIR__ . '/../auth/_cors.php';
header('Content-Type: application/json');

try {
  $st = $pdo->prepare("SELECT id, title, event_date AS eventDate, start_time AS startTime, end_time AS endTime, location, category, description, created_by AS createdBy, created_at AS createdAt FROM events ORDER BY event_date DESC, start_time ASC");
  $st->execute();
  $rows = $st->fetchAll();
  echo json_encode(['events' => $rows]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
}
exit;
