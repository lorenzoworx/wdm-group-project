<?php
require __DIR__ . '/../../../db.php';
require __DIR__ . '/_cors.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$pass = (string)($data['password'] ?? '');

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 6) {
  http_response_code(400); echo json_encode(['error'=>'Invalid input']); exit;
}

# unique email
$st = $pdo->prepare('SELECT id FROM users WHERE email=?'); $st->execute([$email]);
if ($st->fetch()) { http_response_code(409); echo json_encode(['error'=>'Email already registered']); exit; }

$hash = password_hash($pass, PASSWORD_DEFAULT);
$role = 'student';
$ins = $pdo->prepare('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)');
$ins->execute([$name,$email,$hash,$role]);
$user_id = (int)$pdo->lastInsertId();

# create token (7 days)
$token = bin2hex(random_bytes(32));
$exp   = date('Y-m-d H:i:s', time()+60*60*24*7);
$pdo->prepare('INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?,?,?)')
    ->execute([$user_id,$token,$exp]);

echo json_encode([
  'ok'=>true,
  'token'=>$token,
  'user'=>['id'=>$user_id,'name'=>$name,'email'=>$email,'role'=>$role]
]);
