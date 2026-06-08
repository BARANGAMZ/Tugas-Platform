<?php
/**
 * update_barang.php — ENDPOINT TERLINDUNGI + isolasi per-user
 * User hanya bisa mengubah barang MILIKNYA sendiri.
 */
include 'koneksi.php';
include 'auth.php';

cekToken(); // isi $currentUserId

header('Content-Type: application/json');

if (isset($_POST['id'])) {
    $id    = mysqli_real_escape_string($koneksi, $_POST['id']);
    $nama  = mysqli_real_escape_string($koneksi, $_POST['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $_POST['harga']);
    $stok  = mysqli_real_escape_string($koneksi, $_POST['stok']);

    // Klausa WHERE mencakup user_id — tidak bisa ubah barang orang lain
    $query = mysqli_query($koneksi,
        "UPDATE barang
         SET nama_barang='$nama', harga='$harga', stok='$stok'
         WHERE id='$id' AND user_id=$currentUserId"
    );

    if ($query && mysqli_affected_rows($koneksi) > 0) {
        echo json_encode(["status" => "sukses", "pesan" => "Data berhasil diupdate!"]);
    } elseif (mysqli_affected_rows($koneksi) === 0) {
        http_response_code(404);
        echo json_encode(["status" => "error", "pesan" => "Barang tidak ditemukan atau bukan milik Anda."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "pesan" => "Gagal update: " . mysqli_error($koneksi)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "ID tidak ditemukan."]);
}
?>
