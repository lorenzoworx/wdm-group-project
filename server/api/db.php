<?php
// /public_html/api/db.php
// CENTRAL place to create $pdo

$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'REPLACE_ME_DBNAME';
$user = getenv('DB_USER') ?: 'REPLACE_ME_DBUSER';
$pass = getenv('DB_PASS') ?: 'REPLACE_ME_DBPASS';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = new PDO($dsn, $user, $pass, $options);
