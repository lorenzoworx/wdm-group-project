<?php
// server/api/_cors.php
// Central CORS helper used by API endpoints. Place this file in api/ and
// include at top of endpoints: require __DIR__ . '/../_cors.php';
// It will set Access-Control-Allow-* headers and exit on OPTIONS preflight.

// Allowed origins: localhost dev (3000/3001) and the deployed domain
$allowed = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://bxp7143.uta.cloud',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$setOrigin = '*';
if ($origin && in_array($origin, $allowed, true)) {
  $setOrigin = $origin;
}

// Send the chosen origin (either specific allowed origin or wildcard fallback)
header('Access-Control-Allow-Origin: ' . $setOrigin);
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-Requested-With');
header('Access-Control-Max-Age: 600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  // Preflight request: respond with 204 No Content
  http_response_code(204);
  exit;
}
