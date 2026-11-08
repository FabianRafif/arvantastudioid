import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, Award, Compass, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold">
              Tentang Arvanta Studio
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-deep-charcoal editorial-title">
              Digital Experiences, Crafted with Purpose.
            </h1>
            <p className="text-sm sm:text-base text-deep-charcoal/80 leading-relaxed font-normal">
              Arvanta Studio lahir dari kegelisahan terhadap maraknya website dan desain generik tanpa jiwa. Kami memadukan estetika tipografi Swiss, struktur kode bersih, dan strategi pemasaran bisnis nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-3">
              <Award className="w-8 h-8 text-muted-olive" />
              <h3 className="text-xl font-display font-bold text-deep-charcoal">
                Karakteristik & Estetika
              </h3>
              <p className="text-xs text-deep-charcoal/70 leading-relaxed">
                Kami menolak desain asal-asalan. Setiap elemen tipografi, jarak visual, dan susunan warna dipilih untuk membangun reputasi profesional bagi brand Anda.
              </p>
            </div>

            <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-3">
              <Compass className="w-8 h-8 text-muted-olive" />
              <h3 className="text-xl font-display font-bold text-deep-charcoal">
                Keahlian Teknis
              </h3>
              <p className="text-xs text-deep-charcoal/70 leading-relaxed">
                Platform kami menggunakan Next.js, TypeScript, dan database MySQL terstruktur. Bukan sekadar tampilan, namun sistem yang kokoh dan scalable.
              </p>
            </div>

            <div className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-3">
              <HeartHandshake className="w-8 h-8 text-muted-olive" />
              <h3 className="text-xl font-display font-bold text-deep-charcoal">
                Kemitraan Terbuka
              </h3>
              <p className="text-xs text-deep-charcoal/70 leading-relaxed">
                Kami menemani Anda mulai dari konsultasi awal, proses revisi, hingga panduan pengelolaan mandiri melalui dashboard pelanggan.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
