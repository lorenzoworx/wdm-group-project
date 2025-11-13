<?php
// db_test.php - diagnostics for deployed environment
// Place this under /api/ on the server and visit it (or curl) to see whether PHP can load db.php

header('Content-Type: application/json');
require __DIR__ . '/auth/_cors.php';

$info = [
  'ts' => date('c'),
  'cwd' => getcwd(),
  'php_version' => phpversion(),
  'sapi' => php_sapi_name(),
];

// check if db.php exists where other scripts expect it
$db_path = realpath(__DIR__ . '/../../../db.php');
$info['expected_db_path'] = __DIR__ . '/../../../db.php';
$info['db_realpath'] = $db_path ?: null;

// try to include and run a simple query if available
$info['db_include_ok'] = false;
$info['db_error'] = null;
$info['db_query_result'] = null;

if ($db_path && file_exists($db_path)) {
  try {
    // suppress direct warnings, capture exceptions if PDO is used
    $ok = @include($db_path);
    $info['db_include_ok'] = $ok ? true : false;

    // If db.php creates $pdo or $db, try common variable names
    if (isset($pdo) && $pdo) {
      try {
        $st = $pdo->prepare("SELECT 1 AS ok");
        $st->execute();
        $info['db_query_result'] = $st->fetchAll();
      } catch (Exception $ex) {
        $info['db_error'] = 'PDO query failed: ' . $ex->getMessage();
      }
    } elseif (isset($db) && $db) {
      try {
        $st = $db->query("SELECT 1 AS ok");
        $info['db_query_result'] = $st->fetchAll();
      } catch (Exception $ex) {
        $info['db_error'] = 'DB query failed: ' . $ex->getMessage();
      }
    } else {
      $info['db_error'] = 'db.php included but no $pdo or $db variable found.';
    }
  } catch (Throwable $t) {
    $info['db_error'] = 'Include error: ' . $t->getMessage();
  }
} else {
  $info['db_error'] = 'db.php not found at expected location.';
}

// show basic server headers for diagnosis
$info['getallheaders'] = function_exists('getallheaders') ? getallheaders() : [];
$info['server_http_authorization'] = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
$info['redirect_http_authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

echo json_encode($info, JSON_PRETTY_PRINT);
exit;

