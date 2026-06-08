<?php
/**
 * tambah_barang.php — ENDPOINT TERLINDUNGI + isolasi per-user
 */
include 'koneksi.php';
include 'auth.php';

cekToken(); // isi $currentUserId

header('Content-Type: application/json');

if (isset($_POST['nama_barang']) && isset($_POST['harga']) && isset($_POST['stok'])) {
    $nama  = mysqli_real_escape_string($koneksi, $_POST['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $_POST['harga']);
    $stok  = mysqli_real_escape_string($koneksi, $_POST['stok']);

    // Sisipkan user_id agar data terikat ke akun yang tambah
    $query = mysqli_query($koneksi,
        "INSERT INTO barang (nama_barang, harga, stok, user_id)
         VALUES ('$nama', '$harga', '$stok', $currentUserId)"
    );

    if ($query) {
        echo json_encode(["status" => "sukses", "pesan" => "Barang berhasil ditambahkan!"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "pesan" => "Gagal menyimpan: " . mysqli_error($koneksi)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap."]);
}
?>
