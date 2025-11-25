<?php
// server/api/_bootstrap.php
// Lightweight bootstrap to ensure CORS headers are always sent before any heavy work.
// Include this at the very top of every API endpoint to guarantee OPTIONS preflight
// returns CORS headers even if DB config is missing or other errors occur.

// Load the standard auth CORS helper (it sets Access-Control-Allow-* headers and exits on OPTIONS)
if (file_exists(__DIR__ . '/auth/_cors.php')) {
  require __DIR__ . '/auth/_cors.php';
} else {
  // Fallback: set permissive CORS headers for development
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($origin && preg_match('#^https?://(localhost|127\.0\.0\.1|bxp7143\.uta\.cloud)(:\d+)?$#i', $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
  } else {
    header('Access-Control-Allow-Origin: *');
  }
  header('Vary: Origin');
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-Requested-With');
  header('Access-Control-Max-Age: 600');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

// Done: endpoints should include this file first to guarantee OPTIONS responses.

