<?php
require __DIR__ . '/../../../db.php';
require __DIR__ . '/_cors.php';
header('Content-Type: application/json');

// _cors.php already handles OPTIONS with 204

$hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s+([A-Fa-f0-9]{64})$/', $hdr, $m)) {
  // No/invalid token — treat as already logged out
  http_response_code(204);
  exit;
}
$tok = $m[1];

// Prune expired tokens (any user)
$pdo->exec("DELETE FROM user_tokens WHERE expires_at IS NOT NULL AND expires_at <= NOW()");

// Delete ONLY this token (single active session policy means this is the only one anyway)
$stmt = $pdo->prepare('DELETE FROM user_tokens WHERE token = ?');
$stmt->execute([$tok]);

http_response_code(204);
