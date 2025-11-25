<?php
// /home/bxp7143/public_html/api/db.php
// Shared PDO connection helper.
// Reads credentials from environment variables or /home/bxp7143/public_html/.env
// Never echo secrets; only log to error_log on failures.

if (!defined('JSON_HEADER_SENT')) {
  // don’t send any headers here; API scripts should send Content-Type themselves
}

function env_val(string $key, $default = null) {
  $v = getenv($key);
  if ($v !== false && $v !== '') return $v;

  // fallback: read /public_html/.env (one level above /api)
  static $dotenv = null;
  if ($dotenv === null) {
    $dotenv = [];
    $envPath = __DIR__ . '/../.env';
    if (is_readable($envPath)) {
      foreach (preg_split('/\r?\n/', file_get_contents($envPath)) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        [$k, $val] = array_pad(explode('=', $line, 2), 2, '');
        $dotenv[trim($k)] = trim($val, " \t\"'\r\n");
      }
    }
  }
  return $dotenv[$key] ?? $default;
}

// ---- Resolve config (use literals only as last-resort defaults) ----
$DB_HOST = env_val('DB_HOST', 'localhost');
$DB_PORT = (int) env_val('DB_PORT', 3306);

// Do NOT hardcode your password in code. Keep it only in .env.
$DB_NAME = env_val('DB_NAME');            // e.g. bxp7143_wdmphase3
$DB_USER = env_val('DB_USER');            // e.g. bxp7143_wdm
$DB_PASS = env_val('DB_PASS');            // your MySQL user password

// (Optional compatibility with other env names if you ever use Docker/.env)
$DB_NAME = $DB_NAME ?: env_val('MYSQL_DATABASE');
$DB_USER = $DB_USER ?: env_val('MYSQL_USER');
$DB_PASS = $DB_PASS ?: env_val('MYSQL_PASSWORD');

if (!$DB_NAME || !$DB_USER || $DB_PASS === null) {
  error_log('db.php: missing DB config (need DB_NAME, DB_USER, DB_PASS).');
  http_response_code(500);
  echo json_encode(['error' => 'Database configuration missing']);
  exit;
}

$dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $DB_HOST, $DB_PORT, $DB_NAME);

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
  ]);
} catch (PDOException $ex) {
  error_log('db.php connection error: ' . $ex->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed']);
  exit;
}
