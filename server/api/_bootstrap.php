<?php
// /api/_bootstrap.php
// CORS FIRST (so preflight OPTIONS never touches DB)
$allowed = [
    'https://bxp7143.uta.cloud',
    'http://localhost:3000','http://127.0.0.1:3000',
    'http://localhost:3001','http://127.0.0.1:3001',
    'http://localhost:5173','http://127.0.0.1:5173',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allow  = in_array($origin, $allowed, true) ||
    preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $origin);

if ($origin && $allow) {
    header('Access-Control-Allow-Origin: '.$origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-Requested-With');
header('Access-Control-Max-Age: 600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

// AFTER CORS/preflight, load DB
require __DIR__ . '/db.php';
