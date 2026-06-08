<?php
/**
 * login.php
 * Endpoint POST untuk autentikasi user.
 * 
 * Request Body (form-data atau JSON):
 *   username: string
 *   password: string
 * 
 * Response sukses:
 *   {"status":"sukses","pesan":"Login berhasil!","token":"<token>","username":"<username>"}
 */

include 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "pesan" => "Method tidak diizinkan."]);
    exit;
}

// Ambil data dari form-data atau JSON body
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

if (strpos($contentType, 'application/json') !== false) {
    $body = json_decode(file_get_contents('php://input'), true);
    $username = isset($body['username']) ? $body['username'] : '';
    $password = isset($body['password']) ? $body['password'] : '';
} else {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
}

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Username dan password wajib diisi."]);
    exit;
}

// Cari user di database
$usernameEsc = mysqli_real_escape_string($koneksi, $username);
$result = mysqli_query($koneksi, "SELECT * FROM users WHERE username='$usernameEsc' LIMIT 1");

if (!$result || mysqli_num_rows($result) === 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "pesan" => "Username atau password salah."]);
    exit;
}

$user = mysqli_fetch_assoc($result);

// Verifikasi password dengan password_verify (bcrypt)
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "pesan" => "Username atau password salah."]);
    exit;
}

// Generate token baru (64 karakter hex acak)
$token = bin2hex(random_bytes(32));

// Simpan token ke database
$tokenEsc = mysqli_real_escape_string($koneksi, $token);
mysqli_query($koneksi, "UPDATE users SET token='$tokenEsc' WHERE id={$user['id']}");

// Kembalikan token ke client
http_response_code(200);
echo json_encode([
    "status"   => "sukses",
    "pesan"    => "Login berhasil!",
    "token"    => $token,
    "username" => $user['username']
]);
?>
