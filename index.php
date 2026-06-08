<?php
/**
 * index.php — Pintu masuk utama (root)
 * InfinityFree memerlukan file ini di root directory.
 * 
 * Fungsi: Redirect otomatis ke halaman login di folder frontend.
 * Jika user sudah login (ada token di URL param), langsung ke index.html.
 */
header("Location: frontend/login.html", true, 302);
exit;
?>
