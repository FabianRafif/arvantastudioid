import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  MessageSquare,
  FileSpreadsheet,
  CreditCard,
  Layout,
  Code,
  ShieldCheck,
  RotateCcw,
  Rocket,
  ArrowUpRight,
} from "lucide-react";

export const metadata = {
  title: "Cara Kerja & Alur Pengerjaan | Arvanta Studio",
  description:
    "Pelajari bagaimana Arvanta Studio mengubah ide bisnis Anda menjadi platform website siap pakai dengan standar profesional.",
};

export default function CaraKerjaPage() {
  const steps = [
    {
      step: "01",
      title: "Konsultasi & Analisis Kebutuhan",
      desc: "Diskusikan visi, target audiens, dan fitur yang ingin Anda hadirkan melalui formulir pemesanan online atau chat WhatsApp langsung.",
      icon: MessageSquare,
    },
    {
      step: "02",
      title: "Pemilihan Paket & Estimasi Transparan",
      desc: "Pilih paket yang sesuai dengan kebutuhan bisnis Anda (Basic, Professional, atau Premium). Estimasi harga dihitung secara transparan tanpa biaya tersembunyi.",
      icon: FileSpreadsheet,
    },
    {
      step: "03",
      title: "Penerbitan Invoice & Pembayaran DP",
      desc: "Sistem menerbitkan invoice resmi dengan rincian snapshot harga. Anda melakukan pembayaran Down Payment (DP) 50% untuk mengunci jadwal pengerjaan.",
      icon: CreditCard,
    },
    {
      step: "04",
      title: "Verifikasi & Perancangan Arsitektur",
      desc: "Tim keuangan memverifikasi pembayaran Anda, dan tim teknis kami langsung menyusun wireframe, struktur basis data, serta tata letak editorial website.",
      icon: Layout,
    },
    {
      step: "05",
      title: "Pengembangan Kode & Sistem Digital",
      desc: "Pembangunan frontend responsif berkecepatan tinggi dengan Next.js 16 dan sistem pengelolaan konten (CMS) yang aman dan mudah dioperasikan.",
      icon: Code,
    },
    {
      step: "06",
      title: "Pengujian & Review di Staging Server",
      desc: "Sistem diuji pada berbagai perangkat (mobile, tablet, desktop) dan disajikan di tautan rahasia staging agar Anda dapat meninjau hasilnya secara langsung.",
      icon: ShieldCheck,
    },
    {
      step: "07",
      title: "Umpan Balik & Putaran Revisi",
      desc: "Anda dapat mengajukan perbaikan melalui fitur pengajuan revisi di Dashboard Klien hingga hasil akhir sesuai dengan ekspektasi bisnis Anda.",
      icon: RotateCcw,
    },
    {
      step: "08",
      title: "Pelunasan & Peluncuran Resmi (Live)",
      desc: "Setelah pelunasan terverifikasi, sistem kami migrasikan ke domain utama Anda. Dilengkapi panduan penggunaan dan garansi perbaikan bug selama 30 hari.",
      icon: Rocket,
    },
  ];

  return (
    <div className="min-h-screen bg-[#EDECE8] flex flex-col text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      {/* Crafto Editorial Hero Header */}
      <section className="pt-36 pb-16 md:pt-48 md:pb-24 border-b border-[#D8D8D4] relative overflow-hidden">
        {/* Subtle architectural vertical grid guidelines */}
        <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-4 opacity-30">
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="h-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold">
              // METODOLOGI &amp; STANDAR KUALITAS
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            ALUR KERJA TERSTRUKTUR &amp; TERPERCAYA
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Setiap langkah dari konsultasi awal hingga serah terima dipantau secara real-time melalui Dashboard Klien Anda.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] p-8 rounded-2xl shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bebas font-bold text-[#FF9857]">
                        {item.step}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#EDECE8] flex items-center justify-center text-[#2D2D2D]">
                        <Icon className="w-5 h-5 text-[#2D2D2D]" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bebas font-bold text-[#2D2D2D] tracking-wide">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#787875] leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Box */}
          <div className="bg-[#2D2D2D] text-white p-10 sm:p-14 rounded-2xl border border-[#2D2D2D] text-center space-y-6 max-w-4xl mx-auto shadow-xl">
            <span className="inline-block px-3.5 py-1 bg-[#FF9857] text-[#2D2D2D] text-xs font-space font-bold uppercase tracking-wider rounded-full">
              Mulai Langkah Pertama Anda
            </span>
            <h2 className="text-3xl sm:text-5xl font-bebas font-bold text-white tracking-wide">
              Wujudkan Platform Digital Bisnis Anda Hari Ini
            </h2>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed font-sans">
              Pilih paket yang Anda butuhkan dan nikmati kemudahan tracking proses pembuatan website secara transparan melalui sistem kami.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF9857] hover:bg-white text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer shadow-md"
              >
                <span>Mulai Pemesanan Sekarang</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 hover:border-white text-white text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer"
              >
                <span>Bandingkan Daftar Harga</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
