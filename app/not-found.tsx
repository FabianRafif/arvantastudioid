import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-between p-6 sm:p-12 text-deep-charcoal">
      <header className="flex justify-between items-center">
        <Logo variant="dark" size="md" href="/" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-olive font-semibold">
          Error Code 404
        </span>
      </header>

      <main className="max-w-2xl mx-auto my-auto text-center space-y-6 py-12">
        <span className="text-7xl sm:text-9xl font-display font-bold text-muted-olive/30 block tracking-tighter">
          404
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-deep-charcoal">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm sm:text-base text-deep-charcoal/70 leading-relaxed max-w-lg mx-auto">
          Tautan yang Anda tuju mungkin telah dipindahkan, dinonaktifkan, atau tidak pernah ada. Silakan kembali ke beranda untuk menjelajahi katalog layanan Arvanta Studio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-deep-charcoal/30 text-deep-charcoal text-xs font-semibold uppercase tracking-wider rounded-xs hover:border-deep-charcoal transition-colors"
          >
            <Compass className="w-4 h-4 text-muted-olive" />
            <span>Lihat Semua Layanan</span>
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-deep-charcoal/50 font-mono">
        © {new Date().getFullYear()} Arvanta Studio • Digital Solutions, Built with Purpose.
      </footer>
    </div>
  );
}
