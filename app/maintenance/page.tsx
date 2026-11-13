import { Wrench, Clock, MessageCircle, Mail } from "lucide-react";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Sistem Sedang Dalam Pemeliharaan | Arvanta Studio",
  description: "Arvanta Studio sedang melakukan pemeliharaan terjadwal.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-between p-6 sm:p-12 text-deep-charcoal">
      <header className="flex justify-between items-center">
        <Logo variant="dark" size="md" href="/" />
        <span className="text-xs font-mono uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xs font-semibold">
          Maintenance Mode
        </span>
      </header>

      <main className="max-w-2xl mx-auto my-auto text-center space-y-6 py-12">
        <div className="w-16 h-16 rounded-full bg-muted-olive/10 text-muted-olive flex items-center justify-center mx-auto">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
          Pemeliharaan Sistem Terjadwal
        </h1>
        <p className="text-sm sm:text-base text-deep-charcoal/70 leading-relaxed max-w-lg mx-auto">
          Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio.
        </p>

        <div className="p-4 bg-white border border-[#D9D7CF] rounded-xs text-xs text-deep-charcoal/80 max-w-md mx-auto flex items-center justify-center gap-2 font-mono">
          <Clock className="w-4 h-4 text-muted-olive shrink-0" />
          <span>Estimasi selesai: Segera kembali dalam waktu dekat</span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center text-xs">
          <a
            href="https://wa.me/62895322465836"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-deep-charcoal text-warm-ivory font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-muted-olive" />
            <span>Hubungi WhatsApp Admin</span>
          </a>
          <a
            href="mailto:rafifazmi466@gmail.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-deep-charcoal/30 text-deep-charcoal font-semibold uppercase tracking-wider rounded-xs hover:border-deep-charcoal transition-colors"
          >
            <Mail className="w-4 h-4 text-muted-olive" />
            <span>Kirim Email Darurat</span>
          </a>
        </div>
      </main>

      <footer className="text-center text-xs text-deep-charcoal/50 font-mono">
        © {new Date().getFullYear()} Arvanta Studio • Dedicated Enterprise Infrastructure.
      </footer>
    </div>
  );
}
