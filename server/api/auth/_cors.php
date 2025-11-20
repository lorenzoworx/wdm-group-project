<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
  'https://bxp7143.uta.cloud',
  'http://localhost:3000','http://127.0.0.1:3000',
  'http://localhost:3001','http://127.0.0.1:3001',
  'http://localhost:5173','http://127.0.0.1:5173'
];

// Allow configured origins, plus any localhost origin on any port (dev convenience)
$allowOrigin = false;
if ($origin) {
  if (in_array($origin, $allowed, true)) {
    $allowOrigin = $origin;
  } elseif (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $origin)) {
    // allow any localhost origin (including arbitrary port)
    $allowOrigin = $origin;
  }
}

// (remove these debug lines after you confirm behavior)
if (function_exists('error_log')) {
  error_log(sprintf("_cors.php loaded: origin=%s, method=%s, request_uri=%s", $origin, $_SERVER['REQUEST_METHOD'] ?? '', $_SERVER['REQUEST_URI'] ?? ''));
}

if ($allowOrigin) {
  header("Access-Control-Allow-Origin: $allowOrigin");
  header('Vary: Origin');
  // If your client sends cookies or you use credentialed requests, enable this (dev ok).
  header('Access-Control-Allow-Credentials: true');
  // Debug header to help verify the response includes CORS (remove in production)
  header('X-CORS-Debug: 1');
} else {
  // Fallback: if origin isn't allowed explicitly, send a permissive header to avoid blocked preflight
  // This is helpful during development; remove or tighten for production.
  header('Access-Control-Allow-Origin: *');
  header('X-CORS-Debug: 0');
}
// Allow typical methods used by the API; include PUT/PATCH just in case
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
// Allow common headers (including Authorization used by frontend)
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-Authorization, X-Requested-With');
// Cache preflight for a short time
header('Access-Control-Max-Age: 600');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
