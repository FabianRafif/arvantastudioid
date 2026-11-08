import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold">
              Hubungi Kami
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-deep-charcoal editorial-title">
              Let&apos;s Start a Meaningful Project.
            </h1>
            <p className="text-sm sm:text-base text-deep-charcoal/80 leading-relaxed font-normal">
              Punya ide website, ingin merombak identitas brand, atau butuh materi promosi desain grafis? Hubungi kami langsung melalui WhatsApp atau kirim pesan singkat.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="p-8 bg-white border border-[#D9D7CF] rounded-xs space-y-6">
                <h3 className="text-xl font-display font-bold text-deep-charcoal">
                  Saluran Komunikasi Resmi
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 text-muted-olive shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-deep-charcoal font-semibold">
                        WhatsApp Admin Studio (Fast Response)
                      </strong>
                      <a
                        href="https://wa.me/62895322465836"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-muted-olive hover:underline"
                      >
                        +62 895-3224-65836
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-olive shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-deep-charcoal font-semibold">
                        Email Kerjasama
                      </strong>
                      <a
                        href="mailto:contact@arvanta.studio"
                        className="font-mono text-deep-charcoal/80 hover:text-deep-charcoal"
                      >
                        contact@arvanta.studio
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-olive shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-deep-charcoal font-semibold">
                        Studio Base
                      </strong>
                      <span className="text-deep-charcoal/70">
                        Purwokerto & Banyumas, Jawa Tengah, Indonesia
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-olive shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-deep-charcoal font-semibold">
                        Jam Operasional Konsultasi
                      </strong>
                      <span className="text-deep-charcoal/70">
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
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors rounded-xs shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat WhatsApp Admin Sekarang</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Order Quick CTA */}
            <div className="lg:col-span-7 bg-white border border-[#D9D7CF] p-8 lg:p-10 rounded-xs space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-olive font-bold">
                Lebih Cepat Lewat Sistem Order
              </span>
              <h3 className="text-2xl font-display font-bold text-deep-charcoal">
                Ingin Mengirim Formulir Kebutuhan Langsung?
              </h3>
              <p className="text-xs text-deep-charcoal/75 leading-relaxed">
                Anda dapat langsung menggunakan formulir pemesanan online untuk memilih spesifikasi, melampirkan referensi gambar, dan mendapatkan estimasi biaya. Pesanan akan otomatis tercatat dan diteruskan ke WhatsApp admin.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/order?service=WEBSITE"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs"
                >
                  <span>Form Order Website</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/order?service=GRAPHIC_DESIGN"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-deep-charcoal text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                >
                  <span>Form Order Desain</span>
                  <ArrowUpRight className="w-4 h-4" />
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
