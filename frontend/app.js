// =========================================================
// KONFIGURASI ENDPOINT
// Ubah BASE_BACKEND_URL sesuai URL deploy kamu
// =========================================================
const BASE_BACKEND_URL = '../backend';

const ENDPOINT_GET    = `${BASE_BACKEND_URL}/get_barang.php`;
const ENDPOINT_SIMPAN = `${BASE_BACKEND_URL}/tambah_barang.php`;
const ENDPOINT_UPDATE = `${BASE_BACKEND_URL}/update_barang.php`;
const ENDPOINT_HAPUS  = `${BASE_BACKEND_URL}/hapus_barang.php`;

// =========================================================
// HELPER: Ambil token dari localStorage
// =========================================================
function getToken() {
    return localStorage.getItem('token') || '';
}

// =========================================================
// HELPER: Tampilkan toast notifikasi
// =========================================================
function showToast(pesan, tipe = 'sukses') {
    const toast = document.getElementById('toast');
    toast.textContent = pesan;
    toast.className = `show ${tipe}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = ''; }, 3000);
}

// =========================================================
// INIT: Tampilkan username & muat data
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username') || 'admin';
    const label = document.getElementById('usernameLabel');
    if (label) label.textContent = `👤 ${username}`;
    fetchDataBarang();
});

// =========================================================
// FETCH: Ambil semua data barang (GET — publik)
// =========================================================
async function fetchDataBarang() {
    const tbody  = document.getElementById('data-barang');
    const empty  = document.getElementById('empty-state');
    const count  = document.getElementById('table-count');

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8">Memuat data...</td></tr>';

    try {
        // Kirim token via header (cara utama) + URL param (fallback hosting)
        const getUrl = `${ENDPOINT_GET}?_token=${encodeURIComponent(getToken())}`;
        const response = await fetch(getUrl, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();

        tbody.innerHTML = '';

        if (data.status === 'success' && data.data.length > 0) {
            empty.style.display = 'none';
            count.textContent = `${data.data.length} produk`;

            // Update stats
            const aman    = data.data.filter(b => b.stok > 5).length;
            const menipis = data.data.filter(b => b.stok <= 5).length;
            document.getElementById('stat-total').textContent   = data.data.length;
            document.getElementById('stat-aman').textContent    = aman;
            document.getElementById('stat-menipis').textContent = menipis;

            data.data.forEach((barang, index) => {
                const badge = barang.stok > 5
                    ? '<span class="badge badge-green">✅ Tersedia</span>'
                    : '<span class="badge badge-red">⚠️ Menipis</span>';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="c">${index + 1}</td>
                    <td><span class="item-name">${barang.nama_barang}</span></td>
                    <td class="item-price">Rp ${new Intl.NumberFormat('id-ID').format(barang.harga)}</td>
                    <td>${barang.stok} pcs</td>
                    <td class="c">${badge}</td>
                    <td class="c">
                        <div class="row-actions">
                            <button class="btn-action btn-edit"
                                onclick='editBarang(${JSON.stringify(barang)})'
                                title="Edit barang">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                            </button>
                            <button class="btn-action btn-hapus"
                                onclick="hapusBarang(${barang.id})"
                                title="Hapus barang">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6M14 11v6"/>
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                Hapus
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '';
            empty.style.display = 'block';
            count.textContent = '0 produk';
            ['stat-total','stat-aman','stat-menipis'].forEach(id => {
                document.getElementById(id).textContent = '0';
            });
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#ef4444">Gagal memuat data. Periksa koneksi server.</td></tr>';
        console.error(e);
    }
}

// =========================================================
// MODAL: Buka & tutup
// =========================================================
function bukaModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Barang Baru';
    document.getElementById('formBarang').reset();
    document.getElementById('id_barang').value = '';
    document.getElementById('overlay').classList.add('open');
    document.getElementById('nama_barang').focus();
}

function tutupModal() {
    document.getElementById('overlay').classList.remove('open');
}

// Tutup modal ketika klik di luar card
function handleOverlayClick(e) {
    if (e.target === document.getElementById('overlay')) tutupModal();
}

// =========================================================
// EDIT: Isi form dengan data yang dipilih
// =========================================================
function editBarang(barang) {
    document.getElementById('modalTitle').textContent = 'Edit Barang';
    document.getElementById('id_barang').value        = barang.id;
    document.getElementById('nama_barang').value      = barang.nama_barang;
    document.getElementById('harga').value            = barang.harga;
    document.getElementById('stok').value             = barang.stok;
    document.getElementById('overlay').classList.add('open');
}

// =========================================================
// SUBMIT: Tambah atau Update barang (🔒 dengan token)
// =========================================================
document.getElementById('formBarang').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id        = document.getElementById('id_barang').value;
    const formData  = new FormData();
    formData.append('nama_barang', document.getElementById('nama_barang').value);
    formData.append('harga',       document.getElementById('harga').value);
    formData.append('stok',        document.getElementById('stok').value);

    let url = ENDPOINT_SIMPAN;
    if (id) {
        url = ENDPOINT_UPDATE;
        formData.append('id', id);
    }
    // Fallback: sisipkan token juga di FormData
    formData.append('_token', getToken());

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // 🔒 Sertakan token di header (utama)
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.status === 'sukses' || result.status === 'success') {
            tutupModal();
            showToast('✅ ' + result.pesan, 'sukses');
            fetchDataBarang();
        } else if (response.status === 401) {
            showToast('🔒 Sesi habis, silakan login ulang.', 'error');
            setTimeout(() => logout(), 1500);
        } else {
            showToast('❌ ' + (result.pesan || 'Terjadi kesalahan.'), 'error');
        }
    } catch (error) {
        showToast('❌ Gagal menghubungi server.', 'error');
        console.error(error);
    }
});

// =========================================================
// HAPUS: Hapus barang berdasarkan ID (🔒 dengan token)
// =========================================================
async function hapusBarang(id) {
    if (!confirm('Yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.')) return;

    const formData = new FormData();
    formData.append('id', id);
    // Fallback: sisipkan token juga di FormData
    formData.append('_token', getToken());

    try {
        const response = await fetch(ENDPOINT_HAPUS, {
            method: 'POST',
            headers: {
                // 🔒 Sertakan token di header (utama)
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.status === 'sukses' || result.status === 'success') {
            showToast('🗑️ ' + result.pesan, 'sukses');
            fetchDataBarang();
        } else if (response.status === 401) {
            showToast('🔒 Sesi habis, silakan login ulang.', 'error');
            setTimeout(() => logout(), 1500);
        } else {
            showToast('❌ ' + (result.pesan || 'Gagal menghapus.'), 'error');
        }
    } catch (error) {
        showToast('❌ Gagal menghubungi server.', 'error');
        console.error(error);
    }
}

// =========================================================
// LOGOUT
// =========================================================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.replace('login.html');
}

// =========================================================
// PWA: Install & Service Worker
// =========================================================

let _installPrompt = null; // simpan event beforeinstallprompt

// 1. Tangkap event install dari browser (Chrome/Edge/Android)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();           // cegah prompt otomatis
    _installPrompt = e;           // simpan untuk dipicu manual
    const btn = document.getElementById('btn-install');
    if (btn) btn.classList.add('visible'); // tampilkan tombol
    console.log('[PWA] App siap diinstall.');
});

// 2. Tombol install diklik oleh user
async function triggerInstall() {
    if (!_installPrompt) return;
    const btn = document.getElementById('btn-install');
    _installPrompt.prompt();
    const { outcome } = await _installPrompt.userChoice;
    console.log('[PWA] Pilihan user:', outcome);
    _installPrompt = null;
    if (btn) btn.classList.remove('visible');
    if (outcome === 'accepted') {
        showToast('✅ TokoKu berhasil diinstall!', 'success');
    }
}

// 3. Sembunyikan tombol install setelah app terpasang
window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('btn-install');
    if (btn) btn.classList.remove('visible');
    _installPrompt = null;
    showToast('🎉 TokoKu sudah terpasang di perangkat!', 'success');
});

// 4. iOS Safari: tidak support beforeinstallprompt, tampilkan banner manual
function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches
        || ('standalone' in navigator && navigator.standalone);
}

(function checkIosBanner() {
    if (isIos() && !isInStandaloneMode() && !sessionStorage.getItem('ios-banner-closed')) {
        const banner = document.getElementById('ios-banner');
        if (banner) {
            setTimeout(() => banner.classList.add('show'), 1500);
        }
    }
})();

function tutupIosBanner() {
    const banner = document.getElementById('ios-banner');
    if (banner) banner.classList.remove('show');
    sessionStorage.setItem('ios-banner-closed', '1');
}

// 5. Daftarkan Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('[PWA] ✅ Service Worker terdaftar:', reg.scope);
                // Cek jika ada update SW baru
                reg.addEventListener('updatefound', () => {
                    const newSW = reg.installing;
                    newSW.addEventListener('statechange', () => {
                        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                            showToast('🔄 Pembaruan tersedia. Refresh untuk terapkan.', 'success');
                        }
                    });
                });
            })
            .catch(err => console.error('[PWA] ❌ Service Worker gagal:', err));
    });
}
