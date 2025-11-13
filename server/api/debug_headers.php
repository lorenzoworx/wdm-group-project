<?php
// debug_headers.php
// Simple debug endpoint to inspect incoming headers and raw request body.
// Deploy this to your remote under /api/debug_headers.php and then call it
// with the same request your frontend makes to verify headers (Authorization) arrive.

header('Content-Type: application/json');
require __DIR__ . '/auth/_cors.php';

$headers = function_exists('getallheaders') ? getallheaders() : [];
$serverAuth = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
$redirectAuth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
$raw = file_get_contents('php://input');

echo json_encode([
  'ok' => true,
  'ts' => date('c'),
  'headers' => $headers,
  'server_HTTP_AUTHORIZATION' => $serverAuth,
  'server_REDIRECT_HTTP_AUTHORIZATION' => $redirectAuth,
  'raw_body_snippet' => strlen($raw) > 1000 ? substr($raw,0,1000) : $raw
], JSON_PRETTY_PRINT);

exit;

