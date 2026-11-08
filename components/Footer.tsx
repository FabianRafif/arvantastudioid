import Link from "next/link";
import { ArrowUpRight, MessageCircle, Mail, MapPin, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-charcoal text-warm-ivory border-t border-deep-charcoal mt-auto">
      {/* Top Banner CTA */}
      <div className="border-b border-warm-ivory/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-semibold block mb-3">
                Siap Memulai Proyek Anda?
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight editorial-title text-warm-ivory">
                Let&apos;s build something exceptional together.
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-warm-ivory text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive hover:text-warm-ivory transition-all duration-200 rounded-xs"
              >
                <span>Mulai Konsultasi & Order</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/62895322465836"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-warm-ivory/30 text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:border-warm-ivory transition-colors rounded-xs"
              >
                <MessageCircle className="w-4 h-4 text-muted-olive" />
                <span>WhatsApp Admin</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Studio Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-warm-ivory text-deep-charcoal flex items-center justify-center text-sm font-bold tracking-tight rounded-xs">
                A
              </span>
              <span className="text-xl font-bold font-display uppercase tracking-tight text-warm-ivory">
                Arvanta<span className="text-muted-olive">.</span>Studio
              </span>
            </div>
            <p className="text-xs text-warm-ivory/70 max-w-sm leading-relaxed">
              Digital Experiences, Crafted with Purpose. Studio kreatif penyedia jasa pembuatan website performa tinggi, pemeliharaan sistem, dan desain grafis berkarakter editorial untuk bisnis yang berorientasi masa depan.
            </p>
            <div className="flex items-center gap-4 pt-2 text-warm-ivory/60 text-xs">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-olive" />
                Purwokerto & Banyumas, Jawa Tengah
              </span>
            </div>
          </div>

          {/* Services Col */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-olive font-semibold mb-4">
              Layanan Utama
            </h4>
            <ul className="space-y-2.5 text-xs text-warm-ivory/75">
              <li>
                <Link href="/services#website" className="hover:text-warm-ivory transition-colors">
                  Pembuatan Website Bisnis
                </Link>
              </li>
              <li>
                <Link href="/services#landing-page" className="hover:text-warm-ivory transition-colors">
                  Landing Page Konversi Tinggi
                </Link>
              </li>
              <li>
                <Link href="/services#ecommerce" className="hover:text-warm-ivory transition-colors">
                  Toko Online & E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/services#maintenance" className="hover:text-warm-ivory transition-colors">
                  Website Maintenance & Audit
                </Link>
              </li>
              <li>
                <Link href="/services#graphic-design" className="hover:text-warm-ivory transition-colors">
                  Katalog Graphic Design (15+ Kategori)
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Company Col */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-olive font-semibold mb-4">
              Studio & Navigasi
            </h4>
            <ul className="space-y-2.5 text-xs text-warm-ivory/75">
              <li>
                <Link href="/portfolio" className="hover:text-warm-ivory transition-colors">
                  Selected Portofolio
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-warm-ivory transition-colors">
                  Transparansi Paket & Harga
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-warm-ivory transition-colors">
                  Tentang Filosofi Arvanta
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-warm-ivory transition-colors">
                  Hubungi Tim Desainer
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-warm-ivory transition-colors">
                  Formulir Order Kustom
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Direct Col */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-olive font-semibold mb-4">
              Kontak Resmi
            </h4>
            <div className="space-y-3 text-xs text-warm-ivory/75">
              <div>
                <span className="block text-[10px] text-warm-ivory/50 uppercase font-mono">
                  WhatsApp Admin (24/7)
                </span>
                <a
                  href="https://wa.me/62895322465836"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-warm-ivory hover:text-muted-olive transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-muted-olive" />
                  +62 895-3224-65836
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-warm-ivory/50 uppercase font-mono">
                  Email Kerjasama
                </span>
                <a
                  href="mailto:contact@arvanta.studio"
                  className="font-mono text-warm-ivory hover:text-muted-olive transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-olive" />
                  contact@arvanta.studio
                </a>
              </div>
              <div>
                <span className="block text-[10px] text-warm-ivory/50 uppercase font-mono">
                  Jam Konsultasi
                </span>
                <span className="font-mono text-warm-ivory/80">
                  Senin – Sabtu, 08.00 – 21.00 WIB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-warm-ivory/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-warm-ivory/50 font-mono">
          <p>© {currentYear} Arvanta Studio. All rights reserved. Crafted with Purpose.</p>
          <div className="flex items-center gap-6">
            <span>MySQL Laragon Powered</span>
            <span>•</span>
            <span>Secure RBAC & VAPID Push</span>
            <span>•</span>
            <Link href="/login" className="hover:text-warm-ivory transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
