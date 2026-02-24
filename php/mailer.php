<?php
// DEPLOYMENT NOTE:
// When uploading to cPanel, place the php/ folder alongside the exported out/ contents
// so that mailer.php is accessible at /php/mailer.php relative to the site root.
// Also update the 'From:' header below to use a domain that matches your cPanel hosting
// (e.g. noreply@yourdomain.com) — cPanel's mail server may reject mail sent from
// a mismatched domain (currently set to noreply@isahussain.com).

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://isahussain.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot — bots fill hidden fields, real users don't
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true]);
    exit;
}

// Strip tags and sanitize — remove \r\n to prevent header injection
$name    = str_replace(["\r", "\n"], '', trim(strip_tags($_POST['name'] ?? '')));
$email   = str_replace(["\r", "\n"], '', trim(strip_tags($_POST['email'] ?? '')));
$message = trim(strip_tags($_POST['message'] ?? ''));

if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

// Rate limit: max 5 submissions per IP per hour
// Stored in a private directory above the web root
$rateDir = __DIR__ . '/../.rate_limit';
if (!is_dir($rateDir)) mkdir($rateDir, 0700, true);
$rateFile = $rateDir . '/' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');

$fp = fopen($rateFile, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
    $raw = stream_get_contents($fp);
    $rateData = $raw ? (json_decode($raw, true) ?: []) : [];
    $rateData = array_filter($rateData, fn($ts) => $ts > time() - 3600);

    if (count($rateData) >= 5) {
        flock($fp, LOCK_UN);
        fclose($fp);
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many requests. Please try again later.']);
        exit;
    }

    $rateData[] = time();
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($rateData)));
    flock($fp, LOCK_UN);
}
if ($fp) fclose($fp);

$to = getenv('CONTACT_EMAIL');
if (!$to) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Mail configuration error']);
    exit;
}
$subject = 'Portfolio Contact: ' . $name;
$body    = "Name: $name\nEmail: $email\n\nMessage:\n$message";
$headers = implode("\r\n", [
    'From: noreply@isahussain.com',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
]);

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send email']);
}
