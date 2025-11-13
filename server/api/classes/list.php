<?php
require __DIR__ . '/../../../db.php';
require __DIR__ . '/../auth/_cors.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT id, title, course_code AS courseCode, description,
                            instructor, schedule, location,
                            max_students AS maxStudents,
                            current_students AS currentStudents,
                            prerequisites, created_at
                     FROM classes
                     ORDER BY id DESC");
echo json_encode($stmt->fetchAll());
