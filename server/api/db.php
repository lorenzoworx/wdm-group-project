<?php
// /home/bxp7143/public_html/api/db.php
// Central PDO connection helper. Reads credentials from /home/bxp7143/public_html/.env
// Never echo secrets; only log them. Adds a safe debug header when config is missing.

function load_dotenv_above_api(): array {
  static $cache = null;
  if ($cache !== null) return $cache;

  $cache = [];
  $envPath = __DIR__ . '/../.env';               // -> /home/bxp7143/public_html/.env
  $real = realpath($envPath);
  $exists = $real !== false && file_exists($real);
  $readable = $exists && is_readable($real);

  if ($readable) {
    $lines = preg_split('/\r\n|\r|\n/', file_get_contents($real));
    foreach ($lines as $line) {
      $line = trim($line);
      if ($line === '' || $line[0] === '#') continue;
      $parts = explode('=', $line, 2);
      if (count($parts) === 2) {
        $k = trim($parts[0]);
        $v = trim($parts[1], " \t\"'\r\n");
        if ($k !== '') $cache[$k] = $v;
      }
    }
  }

  // Stash minimal diagnostics in a header (safe: no secrets)
  // You can remove this header later.
  header('X-DB-Dotenv-Path: ' . ($real ?: 'missing'));
  header('X-DB-Dotenv-Readable: ' . ($readable ? '1' : '0'));
  header('X-DB-Dotenv-Keys: ' . implode(',', array_keys($cache)));

  return $cache;
}

function env_val(string $key, $default = null) {
  $v = getenv($key);
  if ($v !== false && $v !== '') return $v;
  $dotenv = load_dotenv_above_api();
  return array_key_exists($key, $dotenv) ? $dotenv[$key] : $default;
}

// ---- Resolve config ----
$DB_HOST = env_val('DB_HOST', 'localhost');
$DB_PORT = (int) env_val('DB_PORT', 3306);

// MUST come from .env or real env vars:
$DB_NAME = env_val('DB_NAME') ?: env_val('MYSQL_DATABASE');
$DB_USER = env_val('DB_USER') ?: env_val('MYSQL_USER');
$DB_PASS = env_val('DB_PASS');                 // do not fall back to a literal

if (!$DB_NAME || !$DB_USER || $DB_PASS === null) {
  error_log('db.php: missing DB config: name=' . ($DB_NAME ? 'set' : 'missing') .
            ' user=' . ($DB_USER ? 'set' : 'missing') .
            ' pass=' . ($DB_PASS !== null ? 'set' : 'missing'));
  http_response_code(500);
  header('Content-Type: application/json');
  header('X-DB-Why: missing DB_NAME/DB_USER/DB_PASS');
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
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Database connection failed']);
  exit;
}
