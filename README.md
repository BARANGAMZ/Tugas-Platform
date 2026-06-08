# 🏪 TokoKu — Sistem Manajemen Inventori PWA

Aplikasi web **Progressive Web App (PWA)** untuk mengelola inventori toko berbasis PHP + MySQL. Dapat diinstall di HP dan laptop layaknya aplikasi native.

## ✨ Fitur

- 🔐 **Autentikasi** — Login & Register dengan token-based auth
- 👤 **Isolasi Data Per-User** — Setiap akun memiliki data inventori terpisah
- 📦 **CRUD Barang** — Tambah, lihat, edit, dan hapus barang
- 🔒 **API Terlindungi** — Endpoint CRUD wajib Authorization header
- 📱 **PWA** — Dapat diinstall di Android, iOS, dan desktop
- 🌐 **Offline Support** — Service Worker untuk cache aset

## 🗂 Struktur Proyek

```
platform/
├── index.php              ← Pintu masuk (redirect ke frontend)
├── .htaccess              ← HTTPS redirect + CORS
├── backend/
│   ├── koneksi.example.php  ← Template konfigurasi DB
│   ├── auth.php           ← Helper validasi token
│   ├── login.php          ← POST /login
│   ├── register.php       ← POST /register
│   ├── get_barang.php     ← GET  /barang (butuh token)
│   ├── tambah_barang.php  ← POST /barang (butuh token)
│   ├── update_barang.php  ← POST /barang/update (butuh token)
│   └── hapus_barang.php   ← POST /barang/delete (butuh token)
└── frontend/
    ├── login.html         ← Halaman login & register
    ├── index.html         ← Dashboard inventori (protected)
    ├── app.js             ← Logika frontend + PWA install
    ├── sw.js              ← Service Worker
    ├── manifest.json      ← PWA manifest
    └── icon-*.png         ← App icons
```

## 🚀 Cara Deploy (InfinityFree / Shared Hosting)

### 1. Siapkan Database
Buat database MySQL di hosting, lalu catat:
- Host, Username, Password, Database name

### 2. Konfigurasi Koneksi
```bash
cp backend/koneksi.example.php backend/koneksi.php
# Edit koneksi.php dengan data database kamu
```

### 3. Upload ke Server
Upload semua file ke folder `htdocs/` atau public root hosting.

### 4. Jalankan Setup Database
Akses URL ini di browser **satu kali**:
```
https://domain-kamu/backend/seed_user.php
```
Ini akan membuat tabel `users` dan `barang` secara otomatis.

> ⚠️ **Hapus `seed_user.php`** dari server setelah setup selesai!

### 5. Login Pertama
```
URL     : https://domain-kamu/frontend/login.html
Username: admin
Password: admin123
```

## 🔒 Keamanan API

Endpoint CRUD dilindungi token. Contoh request dengan Postman:

```
POST /backend/hapus_barang.php
Header: Authorization: Bearer <token>
Body  : id=1
```

Tanpa token → `401 Akses Ditolak!`

## 🛠 Tech Stack

| Layer    | Teknologi |
|----------|-----------|
| Frontend | HTML, CSS (Vanilla), JavaScript |
| Backend  | PHP 7+ |
| Database | MySQL |
| Hosting  | InfinityFree / any PHP hosting |
| PWA      | Web App Manifest + Service Worker |
