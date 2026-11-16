"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Clock,
  MessageCircle,
  Mail,
  AlertTriangle,
  Bell,
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Lock,
} from "lucide-react";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

interface AnnouncementItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary?: string | null;
  content: string;
  priority: string;
  publishDate: string;
  endDate?: string | null;
}

export default function GlobalAnnouncementModal() {
  const pathname = usePathname();

  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<AnnouncementItem | null>(null);
  const [activePopup, setActivePopup] = useState<AnnouncementItem | null>(null);
  const [popupDismissed, setPopupDismissed] = useState(true); // default true until verified
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchStatus = async () => {
    try {
      const [resAnnounce, resAuth] = await Promise.all([
        fetch(`/api/announcements?limit=5&t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/auth/me", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }).catch(() => null),
      ]);

      if (resAuth && resAuth.ok) {
        const authData = await resAuth.json();
        const role = authData?.user?.role;
        setIsAdmin(role === "SUPER_ADMIN" || role === "ADMIN");
      }

      if (resAnnounce.ok) {
        const data = await resAnnounce.json();
        const isMaint = Boolean(data.maintenanceMode);
        setMaintenanceActive(isMaint);
        setMaintenanceData(data.activeMaintenance || null);

        // If not in full maintenance, check popup modal
        if (!isMaint && data.activePopup) {
          const popup = data.activePopup as AnnouncementItem;
          const dismissedInSession = sessionStorage.getItem(`arvanta_popup_${popup.id}`);
          if (!dismissedInSession) {
            setActivePopup(popup);
            setPopupDismissed(false);
          } else {
            setActivePopup(null);
            setPopupDismissed(true);
          }
        } else {
          setActivePopup(null);
          setPopupDismissed(true);
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchStatus();

    // Cross-tab real-time sync
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => fetchStatus();
      }
    } catch {}

    const interval = setInterval(fetchStatus, 8000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [pathname]);

  const dismissPopup = () => {
    if (activePopup) {
      sessionStorage.setItem(`arvanta_popup_${activePopup.id}`, "true");
    }
    setPopupDismissed(true);
  };

  // Admin routes & login route must NEVER be fully covered so admin can log in and manage
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/login");

  // =========================================================================
  // KASUS 1: MODE TUTUP WEBSITE (MAINTENANCE SCREEN PENUH)
  // =========================================================================
  if (maintenanceActive && maintenanceData) {
    // Jika rute adalah /admin atau /login:
    if (isAdminRoute || isLoginRoute) {
      return (
        <div className="bg-[#D9381E] text-white py-1.5 px-4 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 sticky top-0 z-[999999] shadow-md">
          <Lock className="w-3.5 h-3.5" />
          <span>
            [PERINGATAN ADMIN] Mode Maintenance Sedang AKTIF di Seluruh Website Publik • Klien & Pengunjung Melihat Layar Pemeliharaan
          </span>
          <Link
            href="/admin/banners"
            className="underline ml-2 bg-white/20 px-2 py-0.5 rounded-xs hover:bg-white/30"
          >
            Matikan di Menu Pengumuman
          </Link>
        </div>
      );
    }

    // Jika admin sedang login dan melihat website publik, tampilkan banner sticky di atas agar admin tetap bisa inspeksi
    if (isAdmin) {
      return (
        <div className="bg-[#D9381E] text-white py-1.5 px-4 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 sticky top-0 z-[999999] shadow-md">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>
            [AKSES KHUSUS ADMIN] Website Saat Ini DITUTUP untuk Publik (Maintenance Mode: {maintenanceData.title}). Anda dapat melihat halaman karena login sebagai Admin.
          </span>
          <Link
            href="/admin/banners"
            className="underline ml-2 bg-white/20 px-2 py-0.5 rounded-xs hover:bg-white/30"
          >
            Kelola Pengumuman
          </Link>
        </div>
      );
    }

    // UNTUK SELURUH PENGUNJUNG PUBLIK & KLIEN: LAYAR PENUTUP WEBSITE LENGKAP
    return (
      <div className="fixed inset-0 z-[999999] bg-[#161614] text-[#EDECE8] flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans antialiased">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4 max-w-4xl w-full mx-auto">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#FF9857] font-black text-xl tracking-tight">//</span>
            <span className="font-bold text-sm tracking-wider uppercase text-white">
              ARVANTA<span className="text-[#FF9857]">.</span>STUDIO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xs border border-amber-500/30">
              Maintenance Mode
            </span>
          </div>
        </header>

        {/* Center Content Card */}
        <main className="max-w-2xl w-full mx-auto my-auto py-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FF9857]/10 text-[#FF9857] flex items-center justify-center mx-auto border border-[#FF9857]/30 shadow-lg">
            <Wrench className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF9857] font-bold block">
              // PEMBERITAHUAN RESMI SISTEM
            </span>
            <h1 className="text-2xl sm:text-4xl font-space font-bold tracking-tight text-white">
              {maintenanceData.title}
            </h1>
          </div>

          <div className="p-6 bg-[#20201D] border border-white/10 rounded-xs text-xs sm:text-sm text-[#EDECE8]/80 leading-relaxed text-left max-w-xl mx-auto space-y-3 shadow-md">
            {maintenanceData.summary ? (
              <p className="font-semibold text-white border-b border-white/10 pb-2">
                {maintenanceData.summary}
              </p>
            ) : null}

            <div
              className="prose prose-invert prose-xs text-[#EDECE8]/80 max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: maintenanceData.content }}
            />

            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-white/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF9857]" />
                <span>
                  Mulai: {new Date(maintenanceData.publishDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </span>
              </div>
              {maintenanceData.endDate ? (
                <div>
                  Estimasi Selesai: {new Date(maintenanceData.endDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </div>
              ) : (
                <span className="text-amber-400">Kembali aktif segera dalam waktu dekat</span>
              )}
            </div>
          </div>

          {/* Action Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/62895322465836?text=Halo%20Admin%20Arvanta,%20saya%20ingin%20menanyakan%20status%20maintenance%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF9857] hover:bg-[#FF8840] text-[#161614] font-space font-bold text-xs uppercase tracking-wider rounded-xs transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi WhatsApp Admin</span>
            </a>
            <a
              href="mailto:rafifazmi466@gmail.com"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-space text-xs uppercase tracking-wider border border-white/10 rounded-xs transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white/70" />
              <span>Kirim Email Darurat</span>
            </a>
          </div>
        </main>

        {/* Footer with discreet Admin Login */}
        <footer className="max-w-4xl w-full mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 font-mono">
          <span>© {new Date().getFullYear()} Arvanta Studio • Dedicated Enterprise Infrastructure</span>
          <Link
            href="/login?redirect=/admin"
            className="hover:text-white transition-colors underline text-[11px]"
          >
            Akses Masuk Admin
          </Link>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // KASUS 2: POP-UP MODAL MELAYANG (UNTUK PENGUMUMAN PENTING / PROMO)
  // Agar pengumuman TIDAK tenggelam di bawah halaman
  // =========================================================================
  if (!popupDismissed && activePopup && !isAdminRoute) {
    const isUrgent = activePopup.priority === "URGENT";
    const isPenting = activePopup.priority === "PENTING";

    return (
      <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-[#EDECE8] text-[#2D2D2D] max-w-lg w-full rounded-xs border-2 border-[#2D2D2D] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="p-4 bg-[#2D2D2D] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isUrgent
                    ? "bg-red-600 text-white animate-pulse"
                    : isPenting
                    ? "bg-[#FF9857] text-[#2D2D2D]"
                    : "bg-white/20 text-white"
                }`}
              >
                {activePopup.priority}
              </span>
              <span className="text-[11px] font-mono text-white/70 uppercase">
                {activePopup.category}
              </span>
            </div>

            <button
              type="button"
              onClick={dismissPopup}
              className="p-1 rounded-xs hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup Pengumuman"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#FF9857]/20 border border-[#FF9857]/40 rounded-full text-[#FF9857] shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-[#2D2D2D]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#787875] uppercase block">
                  {new Date(activePopup.publishDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <h3 className="font-space font-bold text-base sm:text-lg text-[#2D2D2D] leading-snug">
                  {activePopup.title}
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#D9D7CF] rounded-xs text-xs text-[#2D2D2D]/80 leading-relaxed max-h-48 overflow-y-auto">
              {activePopup.summary ? (
                <p className="font-semibold text-[#2D2D2D] mb-1.5">{activePopup.summary}</p>
              ) : null}
              <div
                className="prose prose-xs max-w-none text-[#2D2D2D]/80"
                dangerouslySetInnerHTML={{ __html: activePopup.content }}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={dismissPopup}
                className="px-4 py-2 text-xs font-mono uppercase text-[#787875] hover:text-[#2D2D2D] transition-colors cursor-pointer"
              >
                Tutup / Nanti
              </button>
              <Link
                href={`/pengumuman/${activePopup.slug}`}
                onClick={dismissPopup}
                className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] font-space font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
