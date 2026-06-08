<?php
/**
 * get_barang.php — Ambil data barang milik user yang login.
 * Endpoint ini sekarang MEMERLUKAN token agar data terisolasi per-user.
 */
include 'koneksi.php';
include 'auth.php';

// 🔒 Cek token — isi $currentUserId
cekToken();

$sql   = "SELECT * FROM barang WHERE user_id = $currentUserId ORDER BY id DESC";
$query = mysqli_query($koneksi, $sql);

$hasil = [];
while ($row = mysqli_fetch_assoc($query)) {
    $hasil[] = $row;
}

echo json_encode([
    "status" => "success",
    "data"   => $hasil
]);
?>
