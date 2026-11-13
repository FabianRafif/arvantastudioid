"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Kanban,
  Code2,
  Palette,
  DollarSign,
  Tag,
  ImageIcon,
  Users,
  Layers,
  HelpCircle,
  MessageSquareQuote,
  BarChart3,
  UserCog,
  History,
  Lock,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react";
import Logo from "@/components/Logo";

interface AdminMobileNavProps {
  session: {
    fullName: string;
    username: string;
    role: string;
  };
}

const navSections = [
  {
    title: "Operasional Utama",
    items: [
      { label: "Dashboard Ringkasan", href: "/admin", icon: LayoutDashboard },
      { label: "Manajemen Pesanan", href: "/admin/orders", icon: ShoppingBag },
      { label: "Verifikasi Pembayaran", href: "/admin/payments", icon: CreditCard },
      { label: "Tracking Proyek", href: "/admin/projects", icon: Kanban },
    ],
  },
  {
    title: "Layanan & Harga Dinamis",
    items: [
      { label: "Katalog Layanan Website", href: "/admin/services", icon: Code2 },
      { label: "Katalog Desain Grafis", href: "/admin/design", icon: Palette },
      { label: "Manajemen Harga Dinamis", href: "/admin/pricing", icon: DollarSign },
      { label: "Promo & Kode Voucher", href: "/admin/promotions", icon: Tag },
      { label: "Banner & Pengumuman", href: "/admin/banners", icon: ImageIcon },
    ],
  },
  {
    title: "Pelanggan & Konten",
    items: [
      { label: "Data Pelanggan", href: "/admin/customers", icon: Users },
      { label: "CMS Konten Website", href: "/admin/content", icon: Layers },
      { label: "Kelola FAQ", href: "/admin/faqs", icon: HelpCircle },
      { label: "Moderasi Testimoni", href: "/admin/testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    title: "Laporan & Keamanan",
    items: [
      { label: "Laporan & Analitik", href: "/admin/reports", icon: BarChart3 },
      { label: "Admin & Hak Akses", href: "/admin/users", icon: UserCog },
      { label: "Audit Log Aktivitas", href: "/admin/audit-logs", icon: History },
      { label: "Pusat Keamanan & Sesi", href: "/admin/security", icon: Lock },
      { label: "Pengaturan Website", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminMobileNav({ session }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const initialLetter = (session.fullName || session.username || "A").charAt(0).toUpperCase();

  const drawerContent = (
    <div className="fixed inset-0 z-[99999] md:hidden pointer-events-auto">
      {/* Dark Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full h-[100dvh] bg-[#181916] text-[#EDECE8] flex flex-col justify-between shadow-2xl z-[100000] border-r border-white/10"
        style={{ touchAction: "pan-y" }}
      >
        {/* Top Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#141512]">
          <div className="flex items-center gap-2">
            <Logo variant="light" size="sm" withTagline={false} href="/admin" />
            <span className="text-[9px] font-mono uppercase bg-[#FF9857] text-[#2D2D2D] font-bold px-2 py-0.5 rounded-xs">
              Console
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6">
          {/* User profile card */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FF9857] text-[#2D2D2D] flex items-center justify-center font-bold text-xs shrink-0">
              {initialLetter}
            </div>
            <div className="truncate flex-1">
              <span className="block font-bold text-white text-xs truncate">
                {session.fullName || session.username}
              </span>
              <span className="text-[10px] text-[#FF9857] font-mono block">
                {session.role}
              </span>
            </div>
          </div>

          {/* Grouped Nav Sections */}
          <nav className="space-y-5">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="text-[9px] font-mono tracking-widest uppercase text-white/40 block px-2.5 mb-1.5 font-bold">
                  // {section.title}
                </span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xs text-xs transition-colors ${
                        active
                          ? "bg-[#FF9857] text-[#2D2D2D] font-bold shadow-xs"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-[#2D2D2D]" : "text-[#FF9857]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active && <ChevronRight className="w-4 h-4 text-[#2D2D2D] shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#121310] shrink-0">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <span>Lihat Web Publik</span>
              <ExternalLink className="w-3 h-3 text-[#FF9857]" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#2D2D2D] hover:bg-muted-olive text-warm-ivory text-xs font-bold font-space uppercase tracking-wider transition-colors cursor-pointer select-none shadow-xs shrink-0"
        aria-label="Buka Menu Admin"
      >
        <Menu className="w-4 h-4 text-[#FF9857]" />
        <span>Menu</span>
      </button>

      {/* Render Drawer to document.body via Portal to escape all parent containers */}
      {mounted && isOpen && createPortal(drawerContent, document.body)}
    </>
  );
}
