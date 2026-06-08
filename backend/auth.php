<?php
/**
 * auth.php — Helper autentikasi token.
 *
 * Mendukung DUA cara pengiriman token (untuk kompatibilitas shared hosting):
 *   1. HTTP Header: Authorization: Bearer <token>   ← cara profesional
 *   2. POST field:  _token=<token>                  ← fallback jika header diblokir server
 *
 * Setelah cekToken() dipanggil:
 *   $currentUserId   (int)    — ID user yang login
 *   $currentUsername (string) — Username user yang login
 */

$currentUserId   = null;
$currentUsername = null;

function cekToken() {
    global $koneksi, $currentUserId, $currentUsername;

    $token = '';

    // ── Cara 1: Baca dari HTTP Authorization header ──────────
    // Coba berbagai cara karena shared hosting (InfinityFree, dll)
    // sering memblokir atau mengganti nama header ini.
    $candidates = [
        $_SERVER['HTTP_AUTHORIZATION']          ?? '',
        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '',
    ];

    if (function_exists('getallheaders')) {
        $h = getallheaders();
        // Case-insensitive search
        foreach ($h as $key => $val) {
            if (strtolower($key) === 'authorization') {
                $candidates[] = $val;
                break;
            }
        }
    }

    foreach ($candidates as $c) {
        if (!empty($c) && preg_match('/^Bearer\s+(.+)$/i', $c, $m)) {
            $token = trim($m[1]);
            break;
        }
    }

    // ── Cara 2: Fallback — baca dari POST field '_token' ─────
    // Dipakai jika server benar-benar memblokir Authorization header.
    if (empty($token) && !empty($_POST['_token'])) {
        $token = trim($_POST['_token']);
    }

    // ── Cara 3: Fallback — baca dari GET parameter '_token' ──
    // Dipakai untuk request GET (seperti get_barang.php).
    if (empty($token) && !empty($_GET['_token'])) {
        $token = trim($_GET['_token']);
    }

    // ── Tidak ada token sama sekali ──────────────────────────
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(["status" => "error", "pesan" => "Akses Ditolak!"]);
        exit;
    }

    // ── Validasi token ke database ───────────────────────────
    $tokenEsc = mysqli_real_escape_string($koneksi, $token);
    $result   = mysqli_query($koneksi,
        "SELECT id, username FROM users WHERE token='$tokenEsc' LIMIT 1"
    );

    if (!$result || mysqli_num_rows($result) === 0) {
        http_response_code(401);
        echo json_encode(["status" => "error", "pesan" => "Akses Ditolak!"]);
        exit;
    }

    $user            = mysqli_fetch_assoc($result);
    $currentUserId   = (int) $user['id'];
    $currentUsername = $user['username'];
}
?>
