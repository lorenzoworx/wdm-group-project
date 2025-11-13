<?php
require __DIR__ . '/../../../db.php';
require __DIR__ . '/_cors.php';
header('Content-Type: application/json');

$hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s+([A-Fa-f0-9]{64})/', $hdr, $m)) { http_response_code(401); exit(json_encode(['error'=>'No token'])); }
$tok = $m[1];

$st = $pdo->prepare('SELECT u.id,u.name,u.email,u.role
                     FROM user_tokens t JOIN users u ON u.id=t.user_id
                     WHERE t.token=? AND (t.expires_at IS NULL OR t.expires_at > NOW())');
$st->execute([$tok]); $u = $st->fetch();
if (!$u) { http_response_code(401); echo json_encode(['error'=>'Invalid token']); exit; }

echo json_encode(['ok'=>true,'user'=>$u]);
