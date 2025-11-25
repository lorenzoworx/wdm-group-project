<?php
// server/api/db.php
// Database connection helper used by API endpoints. Reads credentials from environment
// variables or from server/.env (one level above server/api/). Returns a $pdo PDO instance.

// Do not echo sensitive info. Log errors to server error log.

// Helper to read env var or .env fallback
function env($key, $default = null) {
  $v = getenv($key);
  if ($v !== false && $v !== null && $v !== '') return $v;

  // try server/.env (one level above this file)
  static $dotenv = null;
  if ($dotenv === null) {
    $dotenv = [];
    $envPath = __DIR__ . '/../.env';
    if (is_readable($envPath)) {
      $contents = file_get_contents($envPath);
      foreach (preg_split('/\r?\n/', $contents) as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
          $k = trim($parts[0]);
          $val = trim($parts[1], " \t\"'\r\n");
          $dotenv[$k] = $val;
        }
      }
    }
  }

  if (isset($dotenv[$key])) return $dotenv[$key];
  return $default;
}

$DB_HOST = env('DB_HOST') ?: env('MYSQL_HOST') ?: 'localhost';
$DB_NAME = env('DB_NAME') ?: env('MYSQL_DATABASE') ?: env('bxp7143_wdmphase3') ?: null;
$DB_USER = env('DB_USER') ?: env('MYSQL_USER') ?: env('bxp7143_wdmp') ?: null;
$DB_PASS = env('DB_PASS') ?: env('MYSQL_PASSWORD') ?: env('Montana@123') ?: null;
$DB_PORT = env('DB_PORT') ?: 3306;

if (!$DB_NAME || !$DB_USER) {
  error_log('db.php: missing DB config (DB_NAME or DB_USER not set).');
  http_response_code(500);
  echo json_encode(['error' => 'Database configuration missing']);
  exit;
}

$dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $DB_HOST, (int)$DB_PORT, $DB_NAME);

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
} catch (PDOException $ex) {
  // Log the full exception server-side but return a generic error to client
  error_log('db.php connection error: ' . $ex->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed']);
  exit;
}

