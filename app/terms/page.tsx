import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileCheck2, Scale, DollarSign, Clock, RefreshCw, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan Layanan | Arvanta Studio",
  description: "Syarat dan ketentuan pengerjaan website, sistem digital, dan pembayaran Arvanta Studio.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#EDECE8] flex flex-col text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      <main className="flex-1 pt-36 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="border-b border-[#D8D8D4] pb-8 mb-10">
            <span className="text-xs uppercase font-space tracking-widest text-[#787875] font-semibold block mb-2">
              // KETENTUAN KERJASAMA &amp; LEGAL
            </span>
            <h1 className="text-4xl sm:text-6xl font-bebas font-bold text-[#2D2D2D]">
              SYARAT &amp; KETENTUAN LAYANAN
            </h1>
            <p className="mt-3 text-sm text-[#787875]">
              Perjanjian baku pengerjaan layanan teknologi informasi dan pengembangan sistem Arvanta Studio.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-sm leading-relaxed text-deep-charcoal/80">
            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <Scale className="w-5 h-5 text-muted-olive" />
                <span>1. Ketentuan Umum</span>
              </h2>
              <p>
                Dengan membuat pesanan atau menyetujui penawaran harga di Arvanta Studio, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan ini. Ketentuan ini mengikat kedua belah pihak secara sah dalam kerangka pengerjaan proyek digital.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-olive" />
                <span>2. Skema Pembayaran & Snapshot Biaya</span>
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Harga yang berlaku untuk pesanan Anda adalah harga snapshot yang tercatat saat pesanan dibuat dan dikonfirmasi, termasuk diskon atau voucher yang sah. Perubahan harga di kemudian hari tidak mempengaruhi pesanan aktif.</li>
                <li>Setiap pengerjaan website mewajibkan Uang Muka (Down Payment / DP) sebesar minimal 50% sebelum proses desain dan penulisan kode dimulai, kecuali disepakati lain secara tertulis dalam penawaran resmi.</li>
                <li>Pelunasan sisa tagihan wajib diselesaikan setelah sistem selesai diuji di server staging dan sebelum migrasi akhir ke domain utama klien.</li>
                <li>Pembayaran manual via transfer bank baru dianggap sah setelah diverifikasi oleh tim keuangan kami melalui sistem admin.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-olive" />
                <span>3. Waktu Pengerjaan & Komitmen Klien</span>
              </h2>
              <p>
                Estimasi waktu pengerjaan (delivery timeline) mulai dihitung sejak:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Uang muka terverifikasi dalam sistem.</li>
                <li>Seluruh materi esensial (teks profil, logo, foto produk, kredensial hosting) diserahkan lengkap oleh klien.</li>
                <li>Keterlambatan penyerahan materi dari pihak klien akan memperpanjang estimasi deadline secara proporsional.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-muted-olive" />
                <span>4. Batasan Revisi</span>
              </h2>
              <p>
                Setiap paket layanan memiliki kuota revisi yang telah ditentukan (umumnya 2 hingga 3 kali putaran revisi besar). Revisi yang dimaksud mencakup penyesuaian tata letak, warna, tipografi, dan konten. Revisi di luar ruang lingkup (scope change) seperti penambahan modul baru atau perubahan total konsep setelah disetujui akan dikenakan biaya add-on sesuai kesepakatan bersama.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-muted-olive" />
                <span>5. Hak Kekayaan Intelektual & Lisensi</span>
              </h2>
              <p>
                Setelah seluruh tagihan dilunasi:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Klien memiliki hak penuh atas kode program khusus, basis data, dan konten website yang dibuat.</li>
                <li>Lisensi komponen open-source (seperti Next.js, React, Tailwind) tunduk pada lisensi masing-masing vendor (MIT/Apache).</li>
                <li>Klien menjamin bahwa seluruh materi (gambar, teks, video) yang diserahkan tidak melanggar hak cipta pihak manapun.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-display font-bold text-deep-charcoal flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-muted-olive" />
                <span>6. Garansi & Pemeliharaan</span>
              </h2>
              <p>
                Arvanta Studio memberikan garansi perbaikan bug / error gratis selama 30 hari kalender terhitung sejak serah terima sistem. Garansi tidak mencakup kerusakan yang diakibatkan oleh modifikasi kode sepihak oleh pihak ketiga, serangan malware akibat password hosting yang lemah, atau perubahan kebijakan API pihak luar.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
