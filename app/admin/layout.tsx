import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Code2,
  DollarSign,
  Tag,
  Kanban,
  Users,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Shield,
  ExternalLink,
  Image as ImageIcon,
  HelpCircle,
  MessageSquareQuote,
  BarChart3,
  UserCog,
  History,
  Lock,
  Layers,
  Palette,
} from "lucide-react";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import AdminMobileNav from "@/components/AdminMobileNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    redirect("/login?redirect=/admin");
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

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex text-deep-charcoal">
      {/* Sidebar Desktop */}
      <aside className="w-68 bg-deep-charcoal text-warm-ivory hidden md:flex flex-col justify-between shrink-0 border-r border-[#171815] sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-warm-ivory/10">
            <Logo variant="light" size="sm" withTagline={false} href="/admin" />
            <span className="text-[9px] font-mono uppercase bg-muted-olive/30 text-warm-ivory px-2 py-0.5 rounded-xs">
              Console
            </span>
          </div>

          <nav className="space-y-5">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-warm-ivory/40 block px-3">
                  {section.title}
                </span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs text-warm-ivory/80 hover:text-warm-ivory hover:bg-warm-ivory/10 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-olive shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-warm-ivory/10 space-y-3 bg-[#1B1C18]">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-full bg-muted-olive/30 border border-muted-olive/50 flex items-center justify-center text-warm-ivory font-bold shrink-0">
              {session.fullName.charAt(0)}
            </div>
            <div className="truncate flex-1">
              <span className="block font-bold text-warm-ivory text-xs truncate">
                {session.fullName}
              </span>
              <span className="text-[10px] text-muted-olive font-mono block">
                {session.role}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-warm-ivory/10">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] text-warm-ivory/60 hover:text-warm-ivory transition-colors"
            >
              <span>Lihat Web</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#D9D7CF] sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <AdminMobileNav
              session={{
                fullName: session.fullName,
                username: session.username,
                role: session.role,
              }}
            />

            <div className="md:hidden">
              <Logo variant="dark" size="sm" href="/admin" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-deep-charcoal/60 hidden sm:inline-block">
              Arvanta Studio Management Center
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <Link
              href="/order"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep-charcoal text-warm-ivory text-xs font-medium rounded-xs hover:bg-muted-olive transition-colors"
            >
              <span>+ Form Pemesanan</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
