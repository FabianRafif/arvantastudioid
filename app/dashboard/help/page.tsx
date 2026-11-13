import Link from "next/link";
import { MessageCircle, Mail, HelpCircle, FileText, Phone, ArrowUpRight } from "lucide-react";

export default function CustomerHelpPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
          Pusat Bantuan & Dukungan Klien
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Saluran dukungan cepat, panduan operasional sistem, dan kontak langsung ke tim teknis Arvanta Studio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xs bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-deep-charcoal">WhatsApp Dukungan Prioritas</h3>
          <p className="text-xs text-deep-charcoal/70 leading-relaxed">
            Butuh jawaban cepat untuk kendala teknis atau pertanyaan pembayaran? Tim customer support kami aktif pada jam kerja.
          </p>
          <a
            href="https://wa.me/62895322465836"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
          >
            <span>Hubungi +62 895-3224-65836</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xs bg-[#F5F2EB] text-deep-charcoal flex items-center justify-center">
            <Mail className="w-5 h-5 text-muted-olive" />
          </div>
          <h3 className="text-base font-bold text-deep-charcoal">Email Resmi Proyek</h3>
          <p className="text-xs text-deep-charcoal/70 leading-relaxed">
            Untuk pengiriman dokumen kontrak formal, data login hosting sensitif, atau penawaran kerjasama enterprise.
          </p>
          <a
            href="mailto:rafifazmi466@gmail.com"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-deep-charcoal/30 text-deep-charcoal text-xs font-semibold uppercase tracking-wider rounded-xs hover:border-deep-charcoal transition-colors"
          >
            <span>rafifazmi466@gmail.com</span>
          </a>
        </div>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-deep-charcoal">Dokumentasi & Tautan Penting</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <Link
            href="/faq"
            className="p-3 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs hover:border-deep-charcoal font-medium text-deep-charcoal"
          >
            → Tanya Jawab FAQ Publik
          </Link>
          <Link
            href="/cara-kerja"
            className="p-3 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs hover:border-deep-charcoal font-medium text-deep-charcoal"
          >
            → Alur 8 Tahapan Kerja
          </Link>
          <Link
            href="/terms"
            className="p-3 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs hover:border-deep-charcoal font-medium text-deep-charcoal"
          >
            → Syarat & Ketentuan Layanan
          </Link>
        </div>
      </div>
    </div>
  );
}
