<?php
// server/api/chat/llm.php
// NOTE: make sure there is NO BOM/whitespace before `<?php`.

// ---------- CORS (must be first) ----------
$allowed_origins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://bxp7143.uta.cloud',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
  header('Access-Control-Allow-Origin: ' . *);
} else {
  // Fallback: allow deployed host (same-origin) — change if you want stricter policy
  header('Access-Control-Allow-Origin: https://bxp7143.uta.cloud');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 600');
header('Content-Type: application/json');
// Allow cookies/credentials if needed (optional)
// header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  // Preflight: return only the CORS headers and exit
  http_response_code(204);
  exit;
}

// ---------- Input ----------
$raw = file_get_contents('php://input');
$in = json_decode($raw, true) ?: [];
$prompt = trim($in['prompt'] ?? '');
$role   = trim($in['role'] ?? 'guest');
if ($prompt === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Missing prompt']);
  exit;
}

// ---------- API key resolution ----------
$apiKey = getenv('OPENAI_API_KEY') ?: getenv('OPENAI_KEY');
if (!$apiKey) {
  $envPath = __DIR__ . '/../.env';
  if (is_readable($envPath)) {
    foreach (preg_split('/\r?\n/', file_get_contents($envPath)) as $line) {
      $line = trim($line);
      if ($line === '' || $line[0] === '#') continue;
      if (stripos($line, 'OPENAI_API_KEY=') === 0) {
        $apiKey = trim(substr($line, 15), " \t\"'\r\n");
        break;
      }
      if (stripos($line, 'OPENAI_KEY=') === 0) {
        $apiKey = trim(substr($line, 11), " \t\"'\r\n");
        break;
      }
    }
  }
}
if (!$apiKey) {
  http_response_code(500);
  echo json_encode(['error' => 'Server not configured: missing OPENAI_API_KEY']);
  exit;
}

// ---------- OpenAI call ----------
$system = 'You are a helpful assistant for a university portal. Reply concisely and include actionable next steps when appropriate.';
$messages = [
  ['role' => 'system', 'content' => $system],
  ['role' => 'user', 'content' => $prompt]
];

$body = [
  'model' => getenv('OPENAI_MODEL') ?: 'gpt-4o-mini',
  'messages' => $messages,
  'max_tokens' => 512,
  'temperature' => 0.2,
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));

$resp = curl_exec($ch);
$err = curl_error($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($resp === false) {
  http_response_code(502);
  echo json_encode(['error' => 'LLM request failed', 'detail' => $err]);
  exit;
}

$decoded = json_decode($resp, true);
if (!$decoded) {
  http_response_code(502);
  echo json_encode(['error' => 'Invalid LLM response', 'raw' => $resp]);
  exit;
}

// Extract text from choices
$text = null;
if (isset($decoded['choices'][0]['message']['content'])) {
  $text = $decoded['choices'][0]['message']['content'];
} elseif (isset($decoded['choices'][0]['text'])) {
  $text = $decoded['choices'][0]['text'];
}

if ($text === null) {
  http_response_code(502);
  echo json_encode(['error' => 'Unexpected LLM response shape', 'body' => $decoded]);
  exit;
}

echo json_encode(['ok' => true, 'text' => trim($text), 'raw' => null]);
