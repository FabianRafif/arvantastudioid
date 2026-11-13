import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | Arvanta Studio",
  description: "Kebijakan privasi perlindungan data klien dan pengunjung Arvanta Studio.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#EDECE8] flex flex-col text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      <main className="flex-1 pt-36 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="border-b border-[#D8D8D4] pb-8 mb-10">
            <span className="text-xs uppercase font-space tracking-widest text-[#787875] font-semibold block mb-2">
              // LEGAL &amp; KEAMANAN DATA
            </span>
            <h1 className="text-4xl sm:text-6xl font-bebas font-bold text-[#2D2D2D]">
              KEBIJAKAN PRIVASI
            </h1>
            <p className="mt-3 text-sm text-[#787875]">
              Terakhir diperbarui: 13 November 2026 • Berlaku efektif untuk seluruh layanan Arvanta Studio.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-sm leading-relaxed text-deep-charcoal/80">
            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-muted-olive" />
                <span>1. Komitmen Perlindungan Privasi</span>
              </h2>
              <p>
                Arvanta Studio berkomitmen penuh untuk melindungi privasi dan keamanan data pribadi klien, calon pelanggan, serta seluruh pengguna platform digital kami. Kebijakan ini menjelaskan bagaimana data Anda dikumpulkan, digunakan, diproses, dan dilindungi selama Anda menggunakan layanan kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-olive" />
                <span>2. Informasi yang Kami Kumpulkan</span>
              </h2>
              <p>
                Dalam proses penyediaan jasa pembuatan website dan sistem digital, kami mengumpulkan informasi yang Anda berikan secara sadar, antara lain:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Identitas pribadi: Nama lengkap, nama bisnis/instansi, alamat email, dan nomor WhatsApp.</li>
                <li>Data kebutuhan proyek: Dokumen spesifikasi teknis, referensi desain, konten teks, aset gambar, dan kredensial hosting/domain yang diserahkan untuk keperluan instalasi.</li>
                <li>Data transaksi: Nomor invoice, riwayat transaksi, dan bukti pembayaran yang diunggah secara mandiri. Kami tidak pernah menyimpan nomor kartu kredit atau data rahasia perbankan Anda.</li>
                <li>Data teknis: Log sesi aman, alamat IP terenkripsi untuk pencegahan kecurangan, dan jenis peramban saat mengakses platform manajemen kami.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <Eye className="w-5 h-5 text-muted-olive" />
                <span>3. Penggunaan Informasi</span>
              </h2>
              <p>
                Informasi yang kami kumpulkan digunakan secara eksklusif untuk tujuan operasional dan profesional:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Memproses pesanan, menerbitkan surat penawaran, dan menagih tagihan resmi.</li>
                <li>Melakukan komunikasi dua arah terkait perkembangan pengembangan proyek, permintaan revisi, dan serah terima sistem.</li>
                <li>Mengonfigurasi infrastruktur domain, server hosting, dan integrasi API atas persetujuan klien.</li>
                <li>Mencegah akses ilegal, serangan siber, atau transaksi yang mencurigakan.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-olive" />
                <span>4. Keamanan & Penyimpanan Data</span>
              </h2>
              <p>
                Seluruh data akun dilindungi menggunakan hashing kriptografis berstandar industri (Bcrypt/Argon2id). Bukti transfer dan file privat disimpan di direktori privat yang dilindungi otorisasi role-based. Kami tidak pernah menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga untuk kepentingan iklan atau pemasaran eksternal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-muted-olive" />
                <span>5. Hak Klien atas Data</span>
              </h2>
              <p>
                Anda berhak untuk meninjau data profil Anda, meminta pembaruan data, mencadangkan file proyek yang telah diserahterimakan, atau mengajukan penutupan akun setelah seluruh kewajiban kontrak dan pembayaran diselesaikan. Hubungi kami melalui kontak resmi jika Anda memiliki pertanyaan seputar kebijakan ini.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
