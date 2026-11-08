import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Code2,
  Palette,
  FolderGit2,
  Users,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Shield,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

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

  const menuItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Order Management", href: "/admin/orders", icon: ShoppingBag },
    { label: "Layanan Website", href: "/admin/services", icon: Code2 },
    { label: "Katalog Desain Grafis", href: "/admin/design", icon: Palette },
    { label: "Portofolio Showcase", href: "/admin/portfolio", icon: FolderGit2 },
    { label: "Pelanggan / Klien", href: "/admin/customers", icon: Users },
    { label: "Verifikasi Pembayaran", href: "/admin/payments", icon: CreditCard },
    { label: "Notifikasi & WhatsApp", href: "/admin/notifications", icon: Bell },
    { label: "Pengaturan & Keamanan", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex text-deep-charcoal">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-deep-charcoal text-warm-ivory hidden md:flex flex-col justify-between shrink-0 border-r border-deep-charcoal sticky top-0 h-screen">
        <div className="p-6 space-y-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 bg-warm-ivory text-deep-charcoal flex items-center justify-center text-sm font-bold tracking-tight rounded-xs">
              A
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold font-display uppercase tracking-tight text-warm-ivory">
                Arvanta<span className="text-muted-olive">.</span>Admin
              </span>
              <span className="text-[9px] font-mono tracking-widest text-warm-ivory/50 uppercase">
                Studio Console
              </span>
            </div>
          </Link>

          <nav className="space-y-1 text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-warm-ivory/80 hover:text-warm-ivory hover:bg-warm-ivory/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-olive" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-warm-ivory/10 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div className="truncate">
              <span className="block font-bold truncate">{session.fullName}</span>
              <span className="text-[10px] text-warm-ivory/60 font-mono">
                {session.role}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] font-mono text-warm-ivory/60 hover:text-warm-ivory flex items-center gap-1"
            >
              <span>Lihat Web</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-[11px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#D9D7CF] sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
              Arvanta Studio Management System
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-warm-ivory px-3 py-1.5 border border-[#D9D7CF] rounded-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin: {session.username}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
