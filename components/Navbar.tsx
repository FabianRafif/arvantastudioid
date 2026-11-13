"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Shield,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";

import { useLiveSync } from "@/lib/useLiveSync";

interface UserSessionInfo {
  userId: string;
  username: string;
  fullName: string;
  role: string;
}

// 1. Crafto Spaced Rolling Nav Link Component
function RollingNavLink({
  href,
  label,
  isActive,
  badge,
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: string;
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
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col"
        >
          {/* Default Label */}
          <span
            className={`flex h-4 items-center leading-none whitespace-nowrap ${
              isActive ? "text-[#2D2D2D] font-bold" : "text-[#787875] group-hover:text-[#2D2D2D]"
            }`}
          >
            {label}
          </span>
          {/* Rolled In Label (on hover) */}
          <span className="flex h-4 items-center leading-none whitespace-nowrap text-[#FF9857] font-bold">
            {label}
          </span>
        </motion.div>
      </div>

      {badge && (
        <span className="ml-1.5 px-2 py-0.5 text-[9px] font-space font-bold uppercase rounded-full bg-[#FF9857] text-[#2D2D2D]">
          {badge}
        </span>
      )}

      {/* Subtle active indicator below */}
      {isActive && (
        <motion.span
          layoutId="activeNavPill"
          className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-[#FF9857] rounded-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

// 2. Crafto Action Pill (Rounded Pill Button in #2D2D2D, hovers to #FF9857)
function ActionPill({ user }: { user: UserSessionInfo | null }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {user && (
        <Link
          href={user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "/admin" : "/dashboard"}
          className="relative flex h-9 sm:h-10 items-center justify-center rounded-full bg-[#EDECE8] hover:bg-[#2D2D2D] px-3.5 text-xs font-space uppercase tracking-wider font-semibold text-[#2D2D2D] hover:text-white transition-all shadow-xs shrink-0"
          title={user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "Admin Panel" : "Dashboard Klien"}
        >
          <span className="flex items-center gap-1.5">
            {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? (
              <Shield className="w-3.5 h-3.5 text-[#FF9857]" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-[#FF9857]" />
            )}
            <span className="hidden sm:inline">
              {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "Admin" : "Akun"}
            </span>
          </span>
        </Link>
      )}

      <Link
        href="/order"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex h-9 sm:h-10 items-center justify-center rounded-full bg-[#2D2D2D] hover:bg-[#FF9857] px-5 sm:px-6 text-xs font-space uppercase tracking-wider font-bold text-white overflow-hidden shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all select-none shrink-0"
      >
        <div className="relative h-4 overflow-hidden w-[105px] text-center">
          <motion.div
            animate={{ y: isHovered ? "-50%" : "0%" }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col"
          >
            {/* Default State */}
            <span className="flex h-4 items-center justify-center gap-1.5 leading-none text-white whitespace-nowrap">
              <span>MULAI ORDER</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </span>
            {/* Hover Rolled In State */}
            <span className="flex h-4 items-center justify-center gap-1.5 leading-none text-[#2D2D2D] font-bold whitespace-nowrap">
              <span>KIRIM PESAN</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#2D2D2D] stroke-[2.5]" />
            </span>
          </motion.div>
        </div>
      </Link>
    </div>
  );
}

// 3. Main Crafto Architectural Navbar
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserSessionInfo | null>(null);
  const liveSync = useLiveSync();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Layanan", href: "/services" },
    { label: "Daftar Harga", href: "/pricing" },
    {
      label: "Promo",
      href: "/promo",
      badge: liveSync.promotions.navbarBadge || undefined,
    },
    { label: "Cara Kerja", href: "/cara-kerja" },
    { label: "FAQ", href: "/faq" },
    { label: "Tentang", href: "/about" },
    { label: "Kontak", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Floating Architectural Bar (Warm Alabaster Canvas with Subtle 1px Border) */}
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 rounded-full bg-[#EDECE8]/95 backdrop-blur-md px-3 sm:px-4 py-2 border border-[#D8D8D4] shadow-[0_15px_35px_-10px_rgba(45,45,45,0.12)] transition-all duration-300 max-w-5xl ${
          scrolled ? "py-1.5 shadow-[0_20px_40px_-10px_rgba(45,45,45,0.18)]" : "py-2"
        }`}
      >
        {/* Left: Crafto // Logomark */}
        <Link
          href="/"
          className="flex items-center gap-2 pl-2 pr-2 py-0.5 rounded-full transition-transform hover:scale-105 active:scale-95 shrink-0"
          aria-label="Arvanta Studio Home"
        >
          <span className="font-mono text-lg font-black text-[#FF9857] tracking-tight">//</span>
          <span className="font-mono font-bold text-[#2D2D2D] text-xs sm:text-sm tracking-widest uppercase">
            ARVANTA<span className="text-[#FF9857]">.</span>STUDIO
          </span>
        </Link>

        {/* Center: Desktop Rolling Nav Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 px-1">
          {navLinks.map((item) => (
            <RollingNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive(item.href)}
              badge={item.badge}
            />
          ))}
        </div>

        {/* Right Section: Action Button & Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!user && (
            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-mono uppercase tracking-wider font-semibold text-[#787875] hover:text-[#2D2D2D] px-2.5 py-1.5 transition-colors"
            >
              Masuk
            </Link>
          )}

          <ActionPill user={user} />

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full bg-[#2D2D2D]/10 text-[#2D2D2D] hover:bg-[#2D2D2D]/20 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Animated Dropdown Card */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-20 left-4 right-4 max-w-md mx-auto bg-[#EDECE8] border border-[#D8D8D4] rounded-3xl p-6 shadow-2xl text-[#2D2D2D] z-50 flex flex-col gap-3 backdrop-blur-xl"
          >
            <div className="flex flex-col divide-y divide-[#D8D8D4]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-between ${
                    isActive(link.href) ? "text-[#FF9857] font-bold" : "text-[#787875] hover:text-[#2D2D2D]"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-[#FF9857] text-[#2D2D2D]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-[#D8D8D4] flex flex-col gap-2.5">
              {user ? (
                <Link
                  href={user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 bg-[#2D2D2D] hover:bg-[#FF9857] text-white font-mono uppercase tracking-wider font-semibold text-xs rounded-full shadow-sm"
                >
                  {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "Admin Console" : "Dashboard Klien"}
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2.5 border border-[#D8D8D4] text-[#2D2D2D] text-xs font-mono uppercase tracking-wider font-semibold rounded-full hover:bg-black/5"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2.5 bg-[#FF9857] hover:bg-[#E57E3D] text-[#2D2D2D] text-xs font-mono uppercase tracking-wider font-bold rounded-full shadow-sm"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
