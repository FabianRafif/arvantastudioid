import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Website Maintenance in Progress 🚧 | Arvanta Studio",
  description: "Arvanta Studio sedang melakukan peningkatan sistem & website.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#FFFAF4] text-[#1A1A1A] flex flex-col justify-between items-center w-full px-5 py-8 sm:py-12 select-none overflow-y-auto">
      {/* Subtle top indicator */}
      <header className="w-full max-w-xl mx-auto flex justify-between items-center pb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-lg tracking-wider text-[#B18141]">
            ARVANTA STUDIO
          </span>
        </div>
        <span className="text-[11px] font-mono tracking-wider text-[#B18141] bg-[#B18141]/10 border border-[#B18141]/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B18141] animate-pulse" />
          Maintenance
        </span>
      </header>

      {/* Center Card - Identical aesthetic to user reference image */}
      <main className="max-w-xl mx-auto my-auto text-center flex flex-col items-center justify-center py-4">
        <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-[#B18141] leading-[1.18] mb-4 sm:mb-6 font-serif">
          Website Maintenance <br />
          in Progress 🚧
        </h1>

        {/* 3D Claymorphic Illustration matching user image */}
        <div className="w-full max-w-[280px] sm:max-w-[380px] mx-auto my-2 sm:my-3 select-none pointer-events-none">
          <img
            src="/images/maintenance-3d.png"
            alt="Website Maintenance in Progress"
            width={480}
            height={328}
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Message & Contact callouts */}
        <div className="space-y-3 max-w-md mx-auto mt-4 sm:mt-5">
          <p className="text-sm sm:text-base text-[#2D2D2D] font-medium leading-relaxed">
            We&apos;re currently making improvements to our website. Need help?
          </p>

          <div className="pt-2 space-y-1.5 text-xs sm:text-sm text-[#2D2D2D]">
            <p>
              Message us on{" "}
              <a
                href="https://wa.me/62895322465836?text=Halo%20Admin%20Arvanta%20Studio,%20saya%20ingin%20menanyakan%20status%20maintenance%20website"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B18141] hover:underline font-bold inline-flex items-center gap-1 active:scale-95 transition-transform"
              >
                WhatsApp
              </a>{" "}
              or social media
            </p>

            <p>
              Or email us at{" "}
              <a
                href="mailto:rafifazmi466@gmail.com"
                className="text-[#B18141] hover:underline font-bold transition-colors"
              >
                rafifazmi466@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer with discreet Admin Studio Login */}
      <footer className="w-full max-w-xl mx-auto pt-6 flex items-center justify-between text-[11px] text-[#8C827A] border-t border-[#EAE3D2] mt-auto">
        <span>
          © {new Date().getFullYear()} Arvanta Studio • All systems protected.
        </span>
        <Link
          href="/login?redirect=/admin"
          className="text-[#8C827A] hover:text-[#B18141] transition-colors underline flex items-center gap-1"
        >
          <span>Akses Admin Studio</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </footer>
    </div>
  );
}
