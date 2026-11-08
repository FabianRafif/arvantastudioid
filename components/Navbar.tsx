"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  Shield,
  User as UserIcon,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface UserSessionInfo {
  userId: string;
  username: string;
  fullName: string;
  role: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserSessionInfo | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check current auth status via lightweight session probe
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Layanan", href: "/services" },
    { label: "Portofolio", href: "/portfolio" },
    { label: "Paket & Harga", href: "/pricing" },
    { label: "Tentang", href: "/about" },
    { label: "Kontak", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F4F1EA]/90 backdrop-blur-md border-b border-[#D9D7CF] py-3.5 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <span className="w-9 h-9 bg-deep-charcoal text-warm-ivory flex items-center justify-center text-base font-bold tracking-tight rounded-xs group-hover:bg-muted-olive transition-colors">
              A
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-deep-charcoal font-display uppercase">
                Arvanta<span className="text-muted-olive">.</span>Studio
              </span>
              <span className="text-[10px] tracking-wider uppercase text-deep-charcoal/60 -mt-1 font-mono">
                Digital Experiences
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-tight transition-colors duration-150 relative py-1 ${
                  isActive(link.href)
                    ? "text-deep-charcoal font-semibold"
                    : "text-deep-charcoal/70 hover:text-deep-charcoal"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted-olive rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal hover:bg-muted-olive transition-colors rounded-xs shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal hover:bg-muted-olive transition-colors rounded-xs shadow-xs"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Dashboard ({user.username})
                  </Link>
                )}
                <Link
                  href="/order"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-deep-charcoal border border-deep-charcoal hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Order Baru
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-deep-charcoal hover:text-muted-olive transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/order"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal hover:bg-muted-olive transition-colors rounded-xs shadow-xs"
                >
                  <span>Mulai Order</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/order"
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal rounded-xs"
            >
              Order
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-deep-charcoal hover:text-muted-olive focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-[#D9D7CF] bg-[#F4F1EA] px-6 pt-4 pb-8 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium py-1.5 transition-colors border-b border-[#D9D7CF]/40 ${
                  isActive(link.href)
                    ? "text-deep-charcoal font-bold pl-2 border-l-2 border-l-muted-olive"
                    : "text-deep-charcoal/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 flex flex-col gap-2.5">
            {user ? (
              <>
                {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal rounded-xs"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal rounded-xs"
                  >
                    Dashboard Saya ({user.username})
                  </Link>
                )}
                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-deep-charcoal border border-deep-charcoal rounded-xs"
                >
                  Buat Order Baru
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-deep-charcoal border border-deep-charcoal rounded-xs"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-warm-ivory bg-deep-charcoal rounded-xs"
                >
                  Mulai Pesanan Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
