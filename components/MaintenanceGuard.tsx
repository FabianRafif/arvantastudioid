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
      <div className="min-h-screen bg-[#1C1C1A] text-[#EDECE8] flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D] relative z-9999">
        {/* Top Header */}
        <header className="flex justify-between items-center max-w-5xl mx-auto w-full border-b border-white/10 pb-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black text-[#FF9857]">//</span>
            <span className="font-mono font-bold text-white text-sm sm:text-base tracking-wider uppercase">
              ARVANTA<span className="text-[#FF9857]">.</span>STUDIO
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF9857] bg-[#FF9857]/10 border border-[#FF9857]/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#FF9857]" />
            Maintenance Mode
          </span>
        </header>

        {/* Center Card */}
        <main className="max-w-2xl mx-auto my-auto text-center space-y-6 py-12 px-4">
          <div className="w-20 h-20 rounded-full bg-[#FF9857]/15 border border-[#FF9857]/30 text-[#FF9857] flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Wrench className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF9857] font-bold block">
              Pemberitahuan Resmi Pemeliharaan Sistem
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
              {title}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#EDECE8]/80 leading-relaxed max-w-xl mx-auto font-sans">
            {message}
          </p>

          {eta && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xs text-xs text-[#EDECE8] max-w-md mx-auto flex items-center justify-center gap-2.5 font-mono">
              <Clock className="w-4 h-4 text-[#FF9857] shrink-0" />
              <span>Estimasi Selesai: <strong className="text-white">{eta}</strong></span>
            </div>
          )}

          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center text-xs font-mono">
            <a
              href="https://wa.me/62895322465836?text=Halo%20Admin%20Arvanta,%20saya%20ingin%20menanyakan%20status%20maintenance%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF9857] text-[#2D2D2D] font-bold uppercase tracking-wider rounded-xs hover:bg-[#FF8840] transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admin (Darurat)</span>
            </a>
            <a
              href="mailto:rafifazmi466@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white text-white font-bold uppercase tracking-wider rounded-xs hover:bg-white/5 transition-all"
            >
              <Mail className="w-4 h-4 text-[#FF9857]" />
              <span>Kirim Email Resmi</span>
            </a>
          </div>
        </main>

        {/* Footer with discreet Admin Bypass Login */}
        <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#EDECE8]/50 font-mono">
          <span>
            © {new Date().getFullYear()} Arvanta Studio • Dedicated Enterprise Infrastructure.
          </span>
          <Link
            href="/login?redirect=/admin"
            className="text-[#EDECE8]/40 hover:text-[#FF9857] transition-colors underline flex items-center gap-1"
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
