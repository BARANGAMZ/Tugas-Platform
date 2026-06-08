<?php
/**
 * koneksi.php — TEMPLATE KONFIGURASI DATABASE
 *
 * ⚠ File ini adalah CONTOH. File koneksi.php asli (dengan password)
 *   tidak di-commit ke GitHub karena sudah ada di .gitignore.
 *
 * CARA PAKAI di server:
 *   1. Salin file ini menjadi koneksi.php
 *   2. Isi data koneksi sesuai hosting kamu
 *   3. Jangan pernah commit koneksi.php ke GitHub!
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ganti dengan data hosting kamu:
$host = "YOUR_DB_HOST";        // contoh: sql100.infinityfree.com
$user = "YOUR_DB_USER";        // contoh: if0_12345678
$pass = "YOUR_DB_PASSWORD";    // password database
$db   = "YOUR_DB_NAME";        // contoh: if0_12345678_db_toko

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    http_response_code(500);
    die(json_encode(["status" => "error", "pesan" => "Koneksi Database Gagal!"]));
}
?>
