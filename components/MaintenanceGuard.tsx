"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Wrench, Clock, MessageCircle, Mail, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

interface MaintenanceGuardProps {
  initialIsMaintenance?: boolean;
  initialTitle?: string;
  initialMessage?: string;
  initialEta?: string;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export default function MaintenanceGuard({
  initialIsMaintenance = false,
  initialTitle = "Pemeliharaan Sistem Terjadwal",
  initialMessage = "Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio.",
  initialEta = "Segera kembali dalam waktu dekat",
  isAdmin = false,
  children,
}: MaintenanceGuardProps) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(initialIsMaintenance);
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState(initialMessage);
  const [eta, setEta] = useState(initialEta);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/site-status?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.isMaintenance === "boolean") {
        setIsMaintenance(data.isMaintenance);
        if (data.title) setTitle(data.title);
        if (data.message) setMessage(data.message);
        if (data.eta) setEta(data.eta);
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => fetchStatus();
      }
    } catch {}

    const interval = setInterval(fetchStatus, 6000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, []);

  // Whitelisted paths for admin management and authentication
  const isWhitelisted =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname === "/reset-password";

  // If maintenance is ON and user is NOT an admin on a non-whitelisted route: LOCK DOWN!
  if (isMaintenance && !isAdmin && !isWhitelisted) {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#FFFAF4] text-[#1A1A1A] flex flex-col justify-between items-center min-h-screen w-full px-5 py-8 sm:py-12 select-none overflow-y-auto">
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

            {/* Optional dynamic notes set by Admin */}
            {(eta || (message && message !== "Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio.")) && (
              <div className="mt-5 p-3.5 rounded-xl bg-white/80 border border-[#EADBCA] text-xs text-[#555] max-w-sm mx-auto shadow-xs text-center space-y-1">
                {message && message !== "Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio." && (
                  <p className="text-[#333] font-medium">{message}</p>
                )}
                {eta && (
                  <p className="text-[#B18141] font-semibold flex items-center justify-center gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimasi: <strong>{eta}</strong></span>
                  </p>
                )}
              </div>
            )}
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

  // If user is ADMIN and maintenance is ON, allow full browsing with an alert header
  return (
    <>
      {isMaintenance && isAdmin && (
        <aside
          aria-label="Peringatan Admin Mode Maintenance"
          className="bg-amber-400 text-[#1C1C1A] text-xs font-mono font-bold px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-9999 sticky top-0 border-b border-amber-500 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
            <span>
              MODE MAINTENANCE AKTIF: Website sedang ditutup penuh untuk seluruh pengunjung publik &amp; klien.
            </span>
          </div>
          <Link
            href="/admin/banners"
            className="underline hover:text-black uppercase text-[11px] tracking-wider"
          >
            Kelola / Buka Kunci Website →
          </Link>
        </aside>
      )}
      {children}
    </>
  );
}
