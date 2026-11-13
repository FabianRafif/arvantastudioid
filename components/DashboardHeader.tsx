"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  LogOut,
  Shield,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export interface UserSessionInfo {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  email?: string;
}

// Rolling Nav Link (Exact Crafto Interaction matching Gambar 3)
function DashboardRollingNavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center h-8 px-2 sm:px-2.5 rounded-full select-none transition-colors group shrink-0"
    >
      <div className="relative h-3.5 overflow-hidden text-[11px] font-space uppercase tracking-wider font-semibold whitespace-nowrap">
        <motion.div
          animate={{ y: isHovered ? "-50%" : "0%" }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col"
        >
          {/* Default Label */}
          <span
            className={`flex h-3.5 items-center leading-none whitespace-nowrap ${
              isActive
                ? "text-[#2D2D2D] font-bold"
                : "text-[#787875] group-hover:text-[#2D2D2D]"
            }`}
          >
            {label}
          </span>
          {/* Hover Rolled In Label */}
          <span className="flex h-3.5 items-center leading-none whitespace-nowrap text-[#FF9857] font-bold">
            {label}
          </span>
        </motion.div>
      </div>

      {/* Active Indicator Underneath */}
      {isActive && (
        <motion.span
          layoutId="activeDashboardPill"
          className="absolute -bottom-1 left-2 right-2 h-[2px] bg-[#FF9857] rounded-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

export default function DashboardHeader({
  session,
}: {
  session: UserSessionInfo;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "RINGKASAN", href: "/dashboard" },
    { label: "PESANAN SAYA", href: "/dashboard/orders" },
    { label: "TAGIHAN & INVOICE", href: "/dashboard/invoices" },
    { label: "PENGAJUAN REVISI", href: "/dashboard/revisions" },
    { label: "PESAN & CHAT", href: "/dashboard/messages" },
    { label: "PROFIL AKUN", href: "/dashboard/profile" },
    { label: "BANTUAN", href: "/dashboard/help" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const displayName = session.fullName
    ? session.fullName.split(" ")[0]
    : session.username;

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Floating Centered Pill Container (EXACT max-w-5xl as Gambar 3, centered with ample margin) */}
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-2 sm:gap-3 rounded-full bg-[#EDECE8]/95 backdrop-blur-md px-3 sm:px-4 border border-[#D8D8D4] shadow-[0_15px_35px_-10px_rgba(45,45,45,0.12)] transition-all duration-300 max-w-5xl w-full mx-auto select-none ${
          scrolled ? "py-1.5 shadow-[0_20px_40px_-10px_rgba(45,45,45,0.18)]" : "py-2"
        }`}
      >
        {/* Left: Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full transition-transform hover:scale-105 active:scale-95 shrink-0"
          aria-label="Dashboard Customer"
        >
          <span className="font-mono text-base sm:text-lg font-black text-[#FF9857] tracking-tight">
            //
          </span>
          <span className="font-mono font-bold text-[#2D2D2D] text-xs sm:text-sm tracking-wider uppercase whitespace-nowrap">
            ARVANTA<span className="text-[#FF9857]">.</span>STUDIO
          </span>
        </Link>

        {/* Center: Desktop Nav Links (Retaining 100% of Teks from Gambar 1, spaced like Gambar 3) */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 px-1">
          {navLinks.map((item) => (
            <DashboardRollingNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive(item.href)}
            />
          ))}
        </div>

        {/* Right Section: Compact, Balanced & Elegant Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* + PESAN BARU Pill Button (Pill style like MULAI ORDER in Gambar 3) */}
          <Link
            href="/order"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#FF9857] hover:bg-[#2D2D2D] text-[#2D2D2D] hover:text-white font-space font-bold text-[11px] uppercase tracking-wider transition-all shadow-2xs shrink-0 select-none cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ PESAN BARU</span>
            <span className="sm:hidden font-bold">+ PESAN</span>
          </Link>

          {/* Notification Bell */}
          <div className="shrink-0 flex items-center">
            <NotificationBell />
          </div>

          {/* User Account Capsule (Identical to AKUN pill in Gambar 3) */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#D8D8D4]">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDECE8] hover:bg-[#2D2D2D] hover:text-white text-[#2D2D2D] text-[11px] font-space font-bold uppercase tracking-wider transition-all shrink-0"
              title={`${session.fullName} (@${session.username} • ${session.role})`}
            >
              {session.role === "SUPER_ADMIN" || session.role === "ADMIN" ? (
                <Shield className="w-3.5 h-3.5 text-[#FF9857]" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-[#FF9857]" />
              )}
              <span className="truncate max-w-[85px]">{displayName}</span>
            </Link>

            {/* Logout Icon */}
            <form action="/api/auth/logout" method="POST" className="shrink-0">
              <button
                type="submit"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#787875] hover:text-red-600 hover:bg-white/80 transition-colors cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#2D2D2D] hover:bg-white/80 border border-[#D8D8D4] transition-colors shrink-0"
            aria-label="Toggle Dashboard Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-16 sm:top-20 left-4 right-4 bg-[#EDECE8]/98 backdrop-blur-xl border border-[#D8D8D4] shadow-2xl rounded-2xl p-5 space-y-4 max-w-lg mx-auto"
          >
            {/* User Info on Mobile */}
            <div className="pb-3 border-b border-[#D8D8D4] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#2D2D2D]">{session.fullName}</div>
                <div className="text-[10px] text-[#787875] font-space uppercase">
                  @{session.username} • {session.role}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(session.role === "SUPER_ADMIN" || session.role === "ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="px-2.5 py-1 bg-[#2D2D2D] text-white text-[10px] font-space font-bold uppercase rounded-full"
                  >
                    Admin
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="p-1.5 text-[#787875] hover:text-red-600 rounded-full"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-space font-bold uppercase tracking-wider transition-colors ${
                      active
                        ? "bg-[#2D2D2D] text-white"
                        : "text-[#787875] hover:text-[#2D2D2D] hover:bg-white/60"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9857]" />}
                  </Link>
                );
              })}
            </div>

            {/* Order Button on Mobile */}
            <div className="pt-2 border-t border-[#D8D8D4]">
              <Link
                href="/order"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#FF9857] text-[#2D2D2D] font-space font-bold text-xs uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ PESAN BARU SEKARANG</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
