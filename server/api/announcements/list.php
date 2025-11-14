<?php
// server/api/announcements/list.php
// Public: return list of announcements
require __DIR__ . '/../auth/_cors.php';
header('Content-Type: application/json');
require __DIR__ . '/../../../db.php';

try {
  $st = $pdo->query("SELECT id, title, description, department, tags, is_pinned AS isPinned, created_by AS createdBy, created_at AS createdAt FROM announcements ORDER BY created_at DESC");
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);
  // tags stored as JSON or comma string; normalize to array
  foreach ($rows as &$r) {
    if (isset($r['tags'])) {
      $t = $r['tags'];
      if (is_string($t)) {
        $decoded = json_decode($t, true);
        if (is_array($decoded)) $r['tags'] = $decoded;
        else $r['tags'] = array_filter(array_map('trim', explode(',', $t)));
      }
    } else {
      $r['tags'] = [];
    }
    // normalize boolean
    $r['isPinned'] = (bool)($r['isPinned'] ?? false);
  }

  echo json_encode(['ok' => true, 'announcements' => $rows]);
} catch (PDOException $e) {
  error_log('announcements/list.php DB error: ' . $e->getMessage());
  http_response_code(500); echo json_encode(['error' => 'Database error']);
}

