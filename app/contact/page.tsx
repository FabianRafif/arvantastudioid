import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold">
              // HUBUNGI ARVANTA STUDIO
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            LET&apos;S START A MEANINGFUL PROJECT.
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Punya ide website, ingin merombak identitas brand, atau butuh materi promosi desain grafis? Hubungi kami langsung melalui WhatsApp atau kirim pesan singkat.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Info Card */}
            <div className="lg:col-span-5 space-y-8">
              <div className="p-8 sm:p-10 bg-white/80 border border-[#D8D8D4] rounded-2xl space-y-6 shadow-xs">
                <span className="text-xs uppercase tracking-wider font-space text-[#787875] font-semibold block">
                  // SALURAN RESMI
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas">
                  KOMUNIKASI LANGSUNG
                </h3>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDECE8] text-[#2D2D2D] flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-[#FF9857]" />
                    </div>
                    <div>
                      <strong className="block text-[#2D2D2D] font-semibold font-space">
                        WhatsApp Admin (Respon Cepat)
                      </strong>
                      <a
                        href="https://wa.me/62895322465836"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-space text-[#2D2D2D] hover:underline"
                      >
                        +62 895-3224-65836
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDECE8] text-[#2D2D2D] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#FF9857]" />
                    </div>
                    <div>
                      <strong className="block text-[#2D2D2D] font-semibold font-space">
                        Email Kerjasama
                      </strong>
                      <a
                        href="mailto:rafifazmi466@gmail.com"
                        className="font-space text-[#787875] hover:text-[#2D2D2D]"
                      >
                        rafifazmi466@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDECE8] text-[#2D2D2D] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#FF9857]" />
                    </div>
                    <div>
                      <strong className="block text-[#2D2D2D] font-semibold font-space">
                        Studio Base
                      </strong>
                      <span className="text-[#787875] font-sans">
                        Purwokerto &amp; Banyumas, Jawa Tengah, Indonesia
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDECE8] text-[#2D2D2D] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#FF9857]" />
                    </div>
                    <div>
                      <strong className="block text-[#2D2D2D] font-semibold font-space">
                        Jam Konsultasi
                      </strong>
                      <span className="text-[#787875] font-sans">
                        Senin – Sabtu, 08.00 – 21.00 WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/62895322465836?text=Halo%20Arvanta%20Studio,%20saya%20ingin%20konsultasi%20mengenai%20proyek%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat WhatsApp Admin Sekarang ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Order Quick CTA */}
            <div className="lg:col-span-7 bg-white/80 border border-[#D8D8D4] p-8 lg:p-10 rounded-2xl space-y-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider text-[#787875] font-space font-semibold block">
                  // SISTEM ORDER ONLINE
                </span>
                <h3 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] font-bebas">
                  INGIN MENGIRIM FORMULIR KEBUTUHAN LANGSUNG?
                </h3>
                <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                  Anda dapat langsung menggunakan formulir pemesanan online untuk memilih spesifikasi, melampirkan referensi gambar, dan mendapatkan estimasi biaya. Pesanan akan otomatis tercatat di sistem kami dan diteruskan ke WhatsApp admin.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/order?service=WEBSITE"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer shadow-md"
                >
                  <span>Form Order Website</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/order?service=GRAPHIC_DESIGN"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-[#D8D8D4] hover:border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-colors"
                >
                  <span>Form Order Desain</span>
                  <ArrowUpRight className="w-4 h-4 text-[#FF9857]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
