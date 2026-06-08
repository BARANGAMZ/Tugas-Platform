// sw.js — Service Worker PWA TokoKu
// Versi: bump ini setiap kali ada perubahan aset agar cache diperbarui
const CACHE_VERSION = 'tokoku-v3';

const STATIC_ASSETS = [
    './index.html',
    './login.html',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// ── Install: cache semua aset statis ──────────────────────
self.addEventListener('install', (e) => {
    self.skipWaiting(); // aktif langsung tanpa menunggu tab lama ditutup
    e.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Gagal cache sebagian aset:', err);
            });
        })
    );
});

// ── Activate: hapus cache versi lama ─────────────────────
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE_VERSION)
                        .map((k) => {
                            console.log('[SW] Menghapus cache lama:', k);
                            return caches.delete(k);
                        })
                )
            )
            .then(() => clients.claim())
    );
});

// ── Fetch: strategi berdasarkan jenis request ─────────────
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // 1. Abaikan chrome-extension dan non-http
    if (!url.protocol.startsWith('http')) return;

    // 2. Request ke backend PHP → Network Only (tidak di-cache)
    if (url.pathname.includes('/backend/')) {
        e.respondWith(
            fetch(e.request).catch(() =>
                new Response(
                    JSON.stringify({ status: 'error', pesan: 'Anda sedang offline. Coba lagi setelah koneksi tersedia.' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                )
            )
        );
        return;
    }

    // 3. Font Google → Stale-While-Revalidate
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        e.respondWith(
            caches.open(CACHE_VERSION).then(async (cache) => {
                const cached = await cache.match(e.request);
                const fetchPromise = fetch(e.request).then((res) => {
                    cache.put(e.request, res.clone());
                    return res;
                }).catch(() => null);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // 4. Aset frontend → Cache First, fallback ke Network
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;

            return fetch(e.request)
                .then((res) => {
                    // Simpan ke cache kalau response OK
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE_VERSION).then((c) => c.put(e.request, clone));
                    }
                    return res;
                })
                .catch(() => {
                    // Offline fallback → tampilkan login.html
                    return caches.match('./login.html');
                });
        })
    );
});

// ── Background Sync (opsional, untuk aksi saat offline) ──
self.addEventListener('sync', (e) => {
    if (e.tag === 'sync-barang') {
        console.log('[SW] Background sync triggered');
    }
});

// ── Push Notification (siap diaktifkan) ──────────────────
self.addEventListener('push', (e) => {
    const data = e.data ? e.data.json() : { title: 'TokoKu', body: 'Ada pembaruan baru!' };
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: './icon-192.png',
            badge: './icon-192.png',
        })
    );
});
