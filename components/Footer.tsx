import Link from "next/link";
import { MessageCircle, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FF9857] text-[#2D2D2D] relative overflow-hidden mt-auto select-none">
      {/* Top CTA Row */}
      <div className="border-b border-[#2D2D2D]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="text-xs uppercase tracking-widest font-space text-[#2D2D2D] font-bold block mb-3">
                // SIAP BERKOLABORASI DENGAN STUDIO KAMI?
              </span>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.95]">
                LET&apos;S BUILD SOMETHING EXTRAORDINARY TOGETHER.
              </h2>
              <p className="mt-4 text-[#2D2D2D]/85 max-w-2xl text-sm sm:text-base leading-relaxed font-sans">
                Kami siap merancang website berkinerja tinggi, sistem manajemen POS otomatis, dan identitas digital berkelas untuk mempercepat pertumbuhan bisnis Anda.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2D2D2D] hover:bg-white text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Mulai Order ↗</span>
              </Link>
              <a
                href="https://wa.me/62895322465836"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-[#2D2D2D]/40 hover:border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D]/10 text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#2D2D2D]" />
                <span>WhatsApp Siaga</span>
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
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-full bg-[#2D2D2D] text-[#FF9857] flex items-center justify-center font-bold text-base font-space">
                A
              </span>
              <span className="font-bebas tracking-wider text-2xl sm:text-3xl text-[#2D2D2D]">
                // ARVANTA.STUDIO
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#2D2D2D]/80 leading-relaxed max-w-sm pt-2 font-sans">
              Arvanta Studio adalah digital agency &amp; software development studio. Kami membangun platform web kustom, sistem operasional terintegrasi, dan arsitektur digital berkinerja tinggi untuk brand &amp; institusi modern.
            </p>

            <div className="pt-2 flex flex-col gap-2.5 text-xs text-[#2D2D2D]/90 font-space">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#2D2D2D] shrink-0" />
                <span>Purwokerto, Banyumas, Jawa Tengah, Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2D2D2D] shrink-0" />
                <span>rafifazmi466@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#2D2D2D] shrink-0" />
                <span>+62 895-3224-65836</span>
              </div>
            </div>
          </div>

          {/* Layanan Unggulan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-4 font-space pb-2 border-b border-[#2D2D2D]/20">
              Layanan Studio
            </h4>
            <ul className="space-y-2.5 text-xs text-[#2D2D2D]/85 font-sans">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Website Company Profile
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Website Toko Online / E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Landing Page Kampanye Cepat
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Sistem Kasir &amp; POS Toko
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Sistem Reservasi &amp; Booking
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Dashboard Manajemen Bisnis
                </Link>
              </li>
            </ul>
          </div>

          {/* Eksplorasi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-4 font-space pb-2 border-b border-[#2D2D2D]/20">
              Eksplorasi
            </h4>
            <ul className="space-y-2.5 text-xs text-[#2D2D2D]/85 font-sans">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Daftar Harga &amp; Paket
                </Link>
              </li>
              <li>
                <Link href="/promo" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Promo &amp; Penawaran</span>
                  <span className="text-[9px] bg-[#2D2D2D] text-white px-2 py-0.5 rounded-full font-bold font-space uppercase">
                    Aktif
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pengumuman" className="hover:text-white transition-colors">
                  Pengumuman Resmi
                </Link>
              </li>
              <li>
                <Link href="/cara-kerja" className="hover:text-white transition-colors">
                  Cara Kerja &amp; Alur
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Pusat Bantuan &amp; FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Tentang Arvanta Studio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Legalitas & Akses */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-4 font-space pb-2 border-b border-[#2D2D2D]/20">
              Legalitas &amp; Akun
            </h4>
            <ul className="space-y-2.5 text-xs text-[#2D2D2D]/85 font-sans">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login Pelanggan
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Registrasi Akun Baru
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Hubs & Copyright */}
      <div className="border-t border-[#2D2D2D]/15 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2D2D2D]/80 font-space">
          <div>
            &copy; {currentYear} ARVANTA STUDIO. HAK CIPTA DILINDUNGI UNDANG-UNDANG.
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider">
            <span className="font-semibold text-[#2D2D2D]">
              PURWOKERTO • BANYUMAS • JAKARTA • INDONESIA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
