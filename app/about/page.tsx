import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, Check } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold">
              // TENTANG ARVANTA STUDIO
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            MEMBANGUN IDE, MENGHADIRKAN SOLUSI DIGITAL.
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Arvanta Studio adalah studio kreatif dan rekayasa software yang berfokus pada pengembangan website serta sistem operasional digital untuk membantu bisnis, perusahaan, maupun institusi berkembang di era teknologi modern.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Story Card */}
          <div className="bg-white/80 p-8 sm:p-12 rounded-2xl border border-[#D8D8D4] shadow-xs space-y-6 text-sm sm:text-base text-[#2D2D2D] leading-relaxed font-sans">
            <p>
              Kami percaya bahwa setiap bisnis memiliki kebutuhan dan karakteristik yang unik. Karena itu, kami tidak hanya berfokus pada estetika visual, melainkan juga memperhatikan kemudahan pengguna, performa loading, dan integritas data operasional.
            </p>

            <p>
              Melalui perpaduan kreativitas dan teknologi, kami menghadirkan solusi digital yang dirancang sesuai kebutuhan nyata: mulai dari pembuatan website dari awal, pengembangan fitur kustom, hingga sistem kasir POS dan manajemen bisnis.
            </p>

            {/* Komitmen Kami */}
            <div className="pt-8 border-t border-[#D8D8D4] space-y-4">
              <span className="text-xs font-space font-semibold uppercase tracking-wider text-[#787875] block">
                // DEDIKASI KAMI
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] font-bebas">
                KOMITMEN ARVANTA STUDIO
              </h2>
              <p className="text-sm text-[#787875]">
                Kami berkomitmen untuk menghadirkan hasil kerja yang berkualitas tinggi, fungsional, responsif di seluruh gadget, dan dapat diandalkan sepanjang waktu.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-[#EDECE8] border border-[#D8D8D4] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-space font-bold uppercase text-[#2D2D2D]">
                    <Check className="w-3.5 h-3.5 text-[#FF9857]" />
                    <span>Presisi Kode &amp; UI</span>
                  </div>
                  <p className="text-xs text-[#787875]">Standar rekayasa Next.js 16 dan arsitektur database teruji.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#EDECE8] border border-[#D8D8D4] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-space font-bold uppercase text-[#2D2D2D]">
                    <Check className="w-3.5 h-3.5 text-[#FF9857]" />
                    <span>Hak Milik Penuh</span>
                  </div>
                  <p className="text-xs text-[#787875]">Seluruh akses admin, database, dan file master diserahkan 100%.</p>
                </div>
              </div>
            </div>

            {/* Closing Slogan */}
            <div className="pt-6 border-t border-[#D8D8D4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-sm font-space font-bold uppercase text-[#2D2D2D]">
                &ldquo;Digital Solutions, Built with Purpose.&rdquo;
              </span>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all"
              >
                <span>Mulai Konsultasi</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
