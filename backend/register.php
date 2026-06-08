<?php
/**
 * register.php — Endpoint POST untuk pendaftaran akun baru.
 * 
 * Request Body (form-data):
 *   username: string
 *   password: string
 * 
 * Response sukses:
 *   {"status":"sukses","pesan":"Akun berhasil dibuat! Silakan login."}
 */

include 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "pesan" => "Method tidak diizinkan."]);
    exit;
}

$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

if (strpos($contentType, 'application/json') !== false) {
    $body     = json_decode(file_get_contents('php://input'), true);
    $username = isset($body['username']) ? trim($body['username']) : '';
    $password = isset($body['password']) ? $body['password'] : '';
} else {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
}

// Validasi input
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Username dan password wajib diisi."]);
    exit;
}

if (strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Username minimal 3 karakter."]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Password minimal 6 karakter."]);
    exit;
}

// Cek apakah username sudah dipakai
$usernameEsc = mysqli_real_escape_string($koneksi, $username);
$cek = mysqli_query($koneksi, "SELECT id FROM users WHERE username='$usernameEsc' LIMIT 1");

if ($cek && mysqli_num_rows($cek) > 0) {
    http_response_code(409);
    echo json_encode(["status" => "error", "pesan" => "Username sudah digunakan, coba yang lain."]);
    exit;
}

// Hash password & simpan ke database
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$hashedEsc      = mysqli_real_escape_string($koneksi, $hashedPassword);

$query = mysqli_query($koneksi, "INSERT INTO users (username, password) VALUES ('$usernameEsc', '$hashedEsc')");

if ($query) {
    http_response_code(201);
    echo json_encode(["status" => "sukses", "pesan" => "Akun berhasil dibuat! Silakan login."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "pesan" => "Gagal menyimpan akun: " . mysqli_error($koneksi)]);
}
?>
