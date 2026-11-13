"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export interface UserSessionInfo {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  email?: string;
}

// Rolling Nav Link (Crafto Interaction)
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
      className="relative flex items-center h-8 px-2.5 rounded-full select-none transition-colors group shrink-0"
    >
      <div className="relative h-4 overflow-hidden text-[12px] font-space uppercase tracking-wider font-semibold whitespace-nowrap">
        <motion.div
          animate={{ y: isHovered ? "-50%" : "0%" }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col"
        >
          {/* Default Label */}
          <span
            className={`flex h-4 items-center leading-none whitespace-nowrap ${
              isActive
                ? "text-[#2D2D2D] font-bold"
                : "text-[#787875] group-hover:text-[#2D2D2D]"
            }`}
          >
            {label}
          </span>
          {/* Hover Rolled In Label */}
          <span className="flex h-4 items-center leading-none whitespace-nowrap text-[#FF9857] font-bold">
            {label}
          </span>
        </motion.div>
      </div>

      {/* Active Indicator Underneath */}
      {isActive && (
        <motion.span
          layoutId="activeDashboardPill"
          className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-[#FF9857] rounded-full"
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

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      {/* Floating Pill Container (Exact concept as Gambar 2) */}
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-2 lg:gap-4 rounded-full bg-[#EDECE8]/95 backdrop-blur-md px-3 sm:px-4 border border-[#D8D8D4] shadow-[0_15px_35px_-10px_rgba(45,45,45,0.12)] transition-all duration-300 max-w-7xl w-full select-none ${
          scrolled ? "py-1.5 shadow-[0_20px_40px_-10px_rgba(45,45,45,0.18)]" : "py-2"
        }`}
      >
        {/* Left: Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 pl-2 pr-2 py-0.5 rounded-full transition-transform hover:scale-105 active:scale-95 shrink-0"
          aria-label="Dashboard Customer"
        >
          <span className="font-mono text-lg font-black text-[#FF9857] tracking-tight">//</span>
          <span className="font-mono font-bold text-[#2D2D2D] text-xs sm:text-sm tracking-widest uppercase">
            ARVANTA<span className="text-[#FF9857]">.</span>STUDIO
          </span>
        </Link>

        {/* Center: Desktop Nav Links (Retaining Exact Teks of Gambar 1) */}
        <div className="hidden xl:flex items-center gap-1 2xl:gap-2 px-1">
          {navLinks.map((item) => (
            <DashboardRollingNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive(item.href)}
            />
          ))}
        </div>

        {/* Right Section: Actions from Gambar 1 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* + PESAN BARU Pill Button (Exact text and bag icon from Gambar 1) */}
          <Link
            href="/order"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#FF9857] hover:bg-[#2D2D2D] text-[#2D2D2D] hover:text-white font-space font-bold text-xs uppercase tracking-wider transition-all shadow-xs shrink-0 select-none cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ PESAN BARU</span>
            <span className="sm:hidden font-bold">+ PESAN</span>
          </Link>

          {/* Notification Bell */}
          <div className="shrink-0 flex items-center">
            <NotificationBell />
          </div>

          {/* User Profile Badge (Exact text from Gambar 1) */}
          <div className="hidden lg:flex flex-col text-right leading-tight px-1 shrink-0">
            <span className="text-xs font-bold text-[#2D2D2D] truncate max-w-[150px]">
              {session.fullName}
            </span>
            <span className="text-[10px] text-[#787875] font-space uppercase">
              @{session.username} • {session.role}
            </span>
          </div>

          {/* Admin Mode Shortcut (if admin) */}
          {(session.role === "SUPER_ADMIN" || session.role === "ADMIN") && (
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-[10px] font-space font-bold uppercase rounded-full transition-all shrink-0"
              title="Buka Console Admin"
            >
              <Shield className="w-3 h-3 text-[#FF9857]" />
              <span>Admin</span>
            </Link>
          )}

          {/* Logout Button (From Gambar 1) */}
          <form action="/api/auth/logout" method="POST" className="shrink-0">
            <button
              type="submit"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#787875] hover:text-red-600 hover:bg-white/80 border border-transparent hover:border-[#D8D8D4] transition-all cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#2D2D2D] hover:bg-white/80 border border-[#D8D8D4] transition-colors shrink-0"
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
              {(session.role === "SUPER_ADMIN" || session.role === "ADMIN") && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-2.5 py-1 bg-[#2D2D2D] text-white text-[10px] font-space font-bold uppercase rounded-full"
                >
                  Admin Mode
                </Link>
              )}
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
