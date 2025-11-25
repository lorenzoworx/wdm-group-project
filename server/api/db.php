<?php
// /home/bxp7143/public_html/api/db.php
// Central PDO connection helper. Reads credentials from /home/bxp7143/public_html/.env
// Never echo secrets; only log them. Adds a safe debug header when config is missing.

function load_dotenv_above_api(): array {
  static $cache = null;
  if ($cache !== null) return $cache;

  $cache = [];
  $paths = [];

  // Allow explicit override via env var (useful on hosting panels)
  $override = getenv('DB_ENV_PATH') ?: getenv('ENV_PATH') ?: null;
  if ($override) $paths[] = $override;

  // Common locations relative to this file (api/db.php)
  $paths[] = __DIR__ . '/../.env';               // /home/.../public_html/.env
  $paths[] = __DIR__ . '/../../.env';            // /home/.../public_html/.. (maybe one level up)
  $paths[] = __DIR__ . '/../../../.env';         // another fallback
  $paths[] = __DIR__ . '/.env';                  // api/.env (less common)

  // Home directory (persistent across deploys) — ideal place to store secrets on shared hosts
  $home = getenv('HOME') ?: ($_SERVER['HOME'] ?? null);
  if ($home) $paths[] = rtrim($home, "\\/") . '/.env';

  // Last resort: /etc/.env
  $paths[] = '/etc/.env';

  $real = false;
  $readable = false;
  foreach ($paths as $p) {
    if (!$p) continue;
    $rp = realpath($p);
    if ($rp && is_readable($rp)) {
      $real = $rp;
      $readable = true;
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
      break;
    }
  }

  // Stash minimal diagnostics in a header (safe: no secrets)
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

// --- Additional fallback: support a PHP config file that returns an array
function load_php_db_config(array $paths = []) {
  foreach ($paths as $p) {
    if (!$p) continue;
    if (is_readable($p)) {
      // include should return an array or set variables
      $cfg = @include $p;
      if (is_array($cfg)) return $cfg;
      // allow files that define $DB_NAME, $DB_USER, $DB_PASS variables
      // capture them if set
      $vars = [];
      if (isset($DB_NAME) && $DB_NAME) $vars['DB_NAME'] = $DB_NAME;
      if (isset($DB_USER) && $DB_USER) $vars['DB_USER'] = $DB_USER;
      if (isset($DB_PASS) && $DB_PASS) $vars['DB_PASS'] = $DB_PASS;
      // but prefer returned array
    }
  }
  return null;
}

// try to locate db-config PHP files in home and parent directories (outside deploy)
$home = getenv('HOME') ?: ($_SERVER['HOME'] ?? null);
$phpCfgCandidates = [
  __DIR__ . '/../db-config.php',
  __DIR__ . '/../../db-config.php',
  ($home ? rtrim($home, "\\/") . '/.db-config.php' : null),
  '/etc/db-config.php',
];
$phpCfg = load_php_db_config($phpCfgCandidates);
if (is_array($phpCfg)) {
  $DB_NAME = $DB_NAME ?: ($phpCfg['DB_NAME'] ?? $phpCfg['MYSQL_DATABASE'] ?? null);
  $DB_USER = $DB_USER ?: ($phpCfg['DB_USER'] ?? $phpCfg['MYSQL_USER'] ?? null);
  $DB_PASS = $DB_PASS ?? ($phpCfg['DB_PASS'] ?? null);
}

// If any value contains obvious placeholders like REPLACE_ME, treat as missing
function looks_placeholder($v) {
  if ($v === null) return true;
  if (!is_string($v)) return false;
  return preg_match('/REPLACE_ME|CHANGE_ME|PUT_YOUR|example|dummy/i', $v) === 1;
}
if ($DB_NAME && looks_placeholder($DB_NAME)) $DB_NAME = null;
if ($DB_USER && looks_placeholder($DB_USER)) $DB_USER = null;
if ($DB_PASS && looks_placeholder($DB_PASS)) $DB_PASS = null;

if (!$DB_NAME || !$DB_USER || $DB_PASS === null) {
  error_log('db.php: missing DB config: name=' . ($DB_NAME ? 'set' : 'missing') .
            ' user=' . ($DB_USER ? 'set' : 'missing') .
            ' pass=' . ($DB_PASS !== null ? 'set' : 'missing'));

  // Return a JSON error rather than a fatal PHP exception. Keep headers small and safe.
  http_response_code(500);
  header('Content-Type: application/json');
  header('X-DB-Why: missing DB_NAME/DB_USER/DB_PASS');
  header('X-DB-Config-Locations: ' . implode('|', array_filter($phpCfgCandidates)));
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
