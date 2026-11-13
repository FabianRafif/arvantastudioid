# DOKUMENTASI SISTEM ARVANTA STUDIO
## Full-Stack Digital Agency & Client Management Platform

Platform bisnis produksi untuk Arvanta Studio (Jasa Pembuatan Website & Sistem Digital).

---

### 1. LOGO HD DAN IDENTITAS BRAND
Logo resmi Arvanta Studio yang diunggah pemilik telah dikonversi dan dioptimalkan menjadi format Master High Definition (1024x1024) dan Vector SVG tanpa penurunan kualitas gambar:
- `public/images/arvanta-logo-dark.png` : Master PNG transparan gelap untuk background terang (Warm Ivory `#F5F2EB` & Putih).
- `public/images/arvanta-logo-white.png` : Master PNG transparan putih murni untuk background gelap (Charcoal `#242521` & Deep Black `#171815`).
- `public/images/arvanta-symbol-dark.png` & `arvanta-symbol-white.png` : Ikon monogram "a" geometris resolusi tinggi (520x520).
- `public/images/logo.svg` & `logo-white.svg` : Representasi vector SVG crisp-edges untuk tampilan tajam di layar Retina & 4K.
- `app/icon.png` & `app/apple-icon.png` : Favicon dan App Icon Next.js.
- Komponen React `<Logo />` (`components/Logo.tsx`) otomatis menangani kontras dan resolusi tanpa pecah.

---

### 2. STRUKTUR APLIKASI
Platform terdiri dari 2 area utama yang terhubung ke satu basis data MySQL yang sama:

#### A. PUBLIC WEBSITE:
1. **Beranda (`/`)**: Hero editorial luxury, live active promo banner, katalog layanan unggulan, ringkasan harga dinamis, alur pengerjaan, dan CTA konsultasi.
2. **Tentang Arvanta Studio (`/about`)**: Visi, misi, profil studio, dan prinsip kerja.
3. **Katalog Layanan (`/services`)**: 14 kategori spesialisasi layanan dari database.
4. **Detail Layanan Dinamis (`/services/[slug]`)**: Spesifikasi teknis, rincian fitur, perbandingan paket dinamis, dan direct booking button.
5. **Daftar Harga & Paket (`/pricing`)**: 3 tingkatan paket awal (Basic Rp1.500.000, Professional Rp2.000.000, Premium Rp3.000.000) yang tersinkronisasi langsung dari database.
6. **Program Promo & Kupon (`/promo`)**: Banner promo aktif dan voucher kupon dengan salin 1-klik (misal: `ARVANTA1111`, `LAUNCH2026`).
7. **Cara Kerja & Alur Pengerjaan (`/cara-kerja`)**: 8 tahapan terstruktur dari konsultasi hingga peluncuran.
8. **Pusat Bantuan & FAQ (`/faq`)**: Tanya jawab interaktif dari basis data.
9. **Kontak Kami (`/contact`)**: Formulir konsultasi, WhatsApp, dan alamat operasional.
10. **Formulir Pemesanan (`/order`)**: Wizard pemesanan terintegrasi dengan validasi kupon backend dan penguncian snapshot harga.
11. **Autentikasi**: Masuk (`/login`), Pendaftaran (`/register`), Lupa Password (`/forgot-password`), dan Reset Password (`/reset-password`).
12. **Legal**: Kebijakan Privasi (`/privacy`) dan Syarat & Ketentuan (`/terms`).
13. **Error & Maintenance**: Custom 404 (`/_not-found`) dan Pemeliharaan (`/maintenance`).
*(Catatan: Sesuai Master Prompt, portofolio showcase ditiadakan 100% dan diarahkan ke `/services`)*.

#### B. CUSTOMER DASHBOARD (`/dashboard`):
- **Ringkasan**: Metrik pesanan aktif, total tagihan belum bayar, promo, dan notifikasi.
- **Pesanan Saya (`/dashboard/orders`)**: Riwayat pesanan dengan status badge.
- **Detail Pesanan & Tracking Timeline (`/dashboard/orders/[orderNumber]`)**: Pelacakan visual 10+ milestone pengerjaan, unduh deliverable, dan unggah bukti transfer.
- **Tagihan & Invoice (`/dashboard/invoices`)**: Rincian tagihan DP 50% dan pelunasan.
- **Pengajuan Revisi (`/dashboard/revisions`)**: Formulir revisi resmi dengan batas kuota.
- **Percakapan & Chat (`/dashboard/messages`)**: Diskusi langsung dengan admin per nomor order.
- **Profil & Keamanan (`/dashboard/profile`)**: Ganti nama, nomor WhatsApp, dan kata sandi.
- **Pusat Bantuan (`/dashboard/help`)**: Kontak darurat WhatsApp tim teknis.

#### C. PRIVATE ADMIN SYSTEM (`/admin`):
- **Dashboard Overview (`/admin`)**: Metrik real database (omzet, kas masuk, piutang, status order, quick actions).
- **Manajemen Harga Dinamis (`/admin/pricing`)**: Ubah harga paket langsung di database, otomatis merubah harga di frontend dan kalkulator checkout seketika + pencatatan log audit trail perubahan harga.
- **Manajemen Promo & Kupon (`/admin/promotions`)**: CRUD kode voucher, jenis diskon (% atau nominal), kuota penggunaan, minimal transaksi, dan jadwal otomatis.
- **Manajemen Pesanan (`/admin/orders` & `/admin/orders/[id]`)**: Rincian pesanan, invoice DP, verifikasi, dan status.
- **Manajemen Proyek & Tracking (`/admin/projects`)**: Checklist pekerjaan, progres visual, serta pemisahan catatan internal staf (rahasia) dan catatan klien.
- **Katalog Layanan (`/admin/services`)**: CRUD 14 kategori layanan dan paket.
- **Verifikasi Pembayaran (`/admin/payments`)**: Verifikasi atau tolak bukti transfer manual pelanggan dengan catatan alasan.
- **Data Pelanggan (`/admin/customers`)**: Database klien, riwayat transaksi, dan status akun.
- **CMS Konten Website (`/admin/content`)**: Ubah headline hero, deskripsi, dan teks visi-misi tanpa menyentuh kode program.
- **Kelola FAQ (`/admin/faqs`)**: CRUD tanya jawab publik.
- **Laporan & Analitik Keuangan (`/admin/reports`)**: Pemisahan tegas antara Omzet Nilai Kontrak, Kas Masuk Terverifikasi, dan Piutang Belum Dilunasi, dilengkapi fitur Ekspor CSV.
- **Admin & Hak Akses (`/admin/users`)**: Manajemen staf operasional dan hak akses Super Admin.
- **Audit Log Aktivitas (`/admin/audit-logs`)**: Rekam jejak kekal untuk setiap tindakan sensitif sistem (waktu, pelaku, IP, dan detail).
- **Pusat Keamanan & Sesi (`/admin/security`)**: Pembaruan kata sandi admin dan manajemen sesi aktif.

---

### 3. KREDENSIAL AKUN OPERASIONAL DEFAULT
- **Super Admin**:
  - Email: `admin@arvanta.studio` (atau username: `admin`)
  - Password: `admin123`
- **Klien / Pelanggan Demo**:
  - Email: `klien@gmail.com` (atau username: `klien`)
  - Password: `customer123`

---

### 4. BASIS DATA & TEKNOLOGI
- **Database Engine**: MySQL 8.0 (InnoDB) di Laragon (`arvanta_studio`).
- **ORM**: Prisma Client v6.19.3.
- **Frontend**: Next.js 16.4.5 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Keamanan**: Bcrypt 12 rounds, HttpOnly JWT session cookie, Transaction Locking untuk kuota voucher, IDOR prevention.
