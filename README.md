# ARVANTA STUDIO — Premium Digital Agency & Graphic Design Platform
> **Tagline:** Digital Experiences, Crafted with Purpose.  
> **Layanan:** Jasa Pembuatan Website, Website Maintenance, dan Graphic Design.  
> **Base Studio:** Purwokerto & Banyumas, Jawa Tengah, Indonesia  
> **WhatsApp Admin Utama:** `0895322465836` (`62895322465836`)

---

## 1. Arsitektur & Teknologi

- **Frontend & Full-Stack:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling & Design System:** Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Database Utama:** MySQL 8.0 (Laragon Local Environment / Production).
- **ORM:** Prisma ORM v6.19.
- **Autentikasi & Sesi:** Username & Password Only (Argon2 / Bcrypt 12 rounds), HTTPOnly SameSite Secure Cookies, RBAC (`SUPER_ADMIN`, `ADMIN`, `CUSTOMER`).
- **Keamanan:** Proteksi IDOR pada file download terenkripsi, Rate Limiting in-memory, Trusted Devices monitoring, Emergency Logout session revoking, Zod input validation.
- **Integrasi WhatsApp:** Modular provider (WhatsApp Business Cloud API / Fonnte / Wablas) + Automatic Media Attachment Delivery + Fallback Link.
- **Real-Time & Notifikasi:** Web Push API (VAPID multi-device mobile & desktop) + PWA Service Worker (`/sw.js`) + In-Dashboard Audio Chime Alert.

---

## 2. Karakteristik Desain (Non-Generic Agency Aesthetic)

Website Arvanta Studio dirancang dengan arah visual **Premium Editorial Digital Studio** yang terinspirasi dari tipografi Swiss dan modern art direction:
- **Warm Ivory (`#F4F1EA`):** Warna dasar kanvas yang hangat, elegan, dan ramah di mata.
- **Deep Charcoal (`#20211F`):** Warna kontras tipografi utama dan kartu struktural.
- **Muted Olive (`#777B61`):** Warna aksen, badge, dan highlight editorial.
- **Soft Grey (`#D9D7CF`):** Pembatas grid asimetris yang rapi dan terukur.
- **Pure White (`#FFFFFF`):** Kartu produk dan form kontras tinggi.

---

## 3. Akun Bawaan (Default Credentials)

Database MySQL telah di-seed dengan data awal lengkap:

| Peran (Role) | Username | Password | Akses URL |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | `/admin` |
| **Demo Pelanggan** | `klien` | `customer123` | `/dashboard` |

> *Catatan:* Password tersimpan dalam bentuk hash Bcrypt dengan salt 12 rounds (bukan plain text).

---

## 4. Konfigurasi Database (MySQL Laragon)

File `.env` telah dikonfigurasi untuk database Laragon:
```env
DATABASE_URL="mysql://root:@localhost:3306/arvanta_studio"
JWT_SECRET="arvanta-studio-production-secure-key-2026-purwokerto-digital-agency"
ADMIN_WHATSAPP_NUMBER="62895322465836"
```

Untuk menyinkronkan atau menjalankan seed ulang:
```bash
# Push skema tabel ke database MySQL
npx prisma db push

# Menjalankan database seeder
node prisma/seed.js
```

---

## 5. Integrasi WhatsApp & Notifikasi HP Real-Time

### A. Format Pesan WhatsApp Otomatis:
Setiap pesanan baru (Website maupun Desain Grafis) otomatis memicu notifikasi:
```text
[ORDER BARU — ARVANTA STUDIO]

Nomor Order: ARV-2026-0001

Nama: Dimas Pratama
WhatsApp: 081234567890

Layanan: Website Development
Produk/Paket: Landing Page Bisnis — Starter Landing
Harga: Rp500.000

Catatan & Kebutuhan:
Kebutuhan promosi UMKM kuliner Banyumas.

Silakan periksa dashboard admin untuk melihat detail pesanan:
http://localhost:3000/admin/orders/...
```

### B. Pengiriman Foto & Media:
- Foto referensi yang diunggah pelanggan disimpan di direktori privat server (`storage/uploads/`).
- Foto otomatis dikirimkan ke WhatsApp admin sebagai pesan media/gambar via API.
- Jika API token belum diisi pada `.env`, sistem mencatat log status `PENDING_CONFIG` dan menyediakan tombol **Fallback Direct WhatsApp Manual** dengan teks yang sudah terisi lengkap.

### C. Web Push Notification (VAPID):
- Admin dapat mendaftarkan smartphone Android, iPhone, tablet, maupun laptop via tombol **Aktifkan di HP / PC** di Admin Overview atau halaman `/admin/notifications`.
- Notifikasi akan muncul sebagai push alert di layar HP/browser meskipun website tidak sedang dibuka.

---

## 6. Struktur Menu & Fitur Lengkap

### Public Website
- **Homepage (`/`):** Hero editorial, Services overview, Selected projects, Why Arvanta Studio, Working process (5 tahap), Pricing preview, Testimonial, FAQ, Footer lengkap.
- **Layanan (`/services`):** Katalog lengkap jasa website (Rp500.000 – Rp3.000.000) dengan catatan domain & hosting terpisah (Rp500.000 – Rp700.000/th) dan katalog desain grafis (15 kategori mulai Rp50.000).
- **Portofolio (`/portfolio`):** Showcase karya digital terkurasi dengan filter kategori dan tech stack.
- **Paket & Harga (`/pricing`):** Panduan transparansi biaya tanpa biaya tersembunyi.
- **Tentang (`/about`):** Filosofi dan komitmen mutu Arvanta Studio.
- **Kontak (`/contact`):** Peta studio, alamat email, dan tombol direct WhatsApp ke admin `0895322465836`.
- **Formulir Order Kustom (`/order`):** Sistem pemesanan dinamis untuk Website & Desain Grafis, estimasi harga live, DP 50%, dan upload berkas referensi.

### Portal Pelanggan (`/dashboard`)
- **Ringkasan (`/dashboard`):** Total pesanan, pesanan aktif, pesanan selesai, dan tombol buat pesanan baru.
- **Daftar Pesanan (`/dashboard/orders`):** Seluruh riwayat transaksi dengan filter status.
- **Tracking Pesanan (`/dashboard/orders/[orderNumber]`):**
  - Timeline status interaktif (Pending ➔ Konfirmasi Brief ➔ Menunggu Pembayaran ➔ Pembayaran Diverifikasi ➔ In Progress ➔ Revisi ➔ Selesai).
  - Formulir unggah bukti transfer bank (BCA / Mandiri) atau QRIS untuk DP maupun pelunasan.
  - Serah terima file hasil akhir (deliverables) dengan link download aman.
  - Formulir pengajuan revisi proyek.
  - Diskusi pesan langsung dua arah dengan admin studio.

### Panel Admin (`/admin`)
- **Overview (`/admin`):** KPI real-time (Total Order, Dalam Pengerjaan, Pelanggan, Pendapatan Sah), tabel pesanan terbaru, dan konsol Web Push.
- **Manajemen Order (`/admin/orders`):** Filter status, inspeksi brief lengkap, unggah file hasil untuk klien, ubah nominal biaya & DP, catatan internal, dan timeline status.
- **Manajemen Layanan (`/admin/services`):** CRUD paket website, atur fitur, estimasi hari pengerjaan, dan catatan domain & hosting.
- **Katalog Desain Grafis (`/admin/design`):** CRUD 15 kategori produk desain grafis mulai Rp50.000.
- **Verifikasi Pembayaran (`/admin/payments`):** Periksa bukti screenshot transfer pelanggan, sahkan (VERIFIED) atau tolak (REJECTED). Verifikasi otomatis memajukan status pesanan ke tahap pengerjaan.
- **Database Pelanggan (`/admin/customers`):** Data seluruh klien, nomor WhatsApp, dan riwayat pesanan.
- **Pusat Notifikasi (`/admin/notifications`):** Pengujian kirim pesan WhatsApp API live dan pengujian Web Push ke HP.
- **Pengaturan & Keamanan (`/admin/settings`):** Konfigurasi brand, nomor WhatsApp admin, manajemen perangkat terpercaya (Trusted Devices), dan Emergency Logout untuk memutus paksa sesi di perangkat lain.

---

## 7. Menjalankan Aplikasi

```bash
# 1. Masuk ke direktori proyek
cd arvanta-studio

# 2. Pastikan MySQL Laragon aktif (port 3306)

# 3. Jalankan Development Server
npm run dev

# Aplikasi dapat diakses di http://localhost:3000
```

Untuk menjalankan versi produksi:
```bash
npm run build
npm run start
```
