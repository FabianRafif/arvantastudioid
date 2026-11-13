import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  User,
  LogOut,
  ExternalLink,
  MessageCircle,
  FileCheck,
  Shield,
  CreditCard,
  RotateCcw,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const customerNav = [
    { label: "Ringkasan", href: "/dashboard" },
    { label: "Pesanan Saya", href: "/dashboard/orders" },
    { label: "Tagihan & Invoice", href: "/dashboard/invoices" },
    { label: "Pengajuan Revisi", href: "/dashboard/revisions" },
    { label: "Pesan & Chat", href: "/dashboard/messages" },
    { label: "Profil Akun", href: "/dashboard/profile" },
    { label: "Bantuan", href: "/dashboard/help" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col text-deep-charcoal">
      {/* Dashboard Topbar */}
      <header className="bg-white border-b border-[#D9D7CF] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="dark" size="sm" withTagline={false} href="/dashboard" />

            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
              {customerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-deep-charcoal/70 hover:text-deep-charcoal transition-colors py-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted-olive text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-deep-charcoal transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>+ Pesan Baru</span>
            </Link>

            <NotificationBell />

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-deep-charcoal">
                {session.fullName}
              </span>
              <span className="text-[10px] text-deep-charcoal/60 font-mono">
                @{session.username} • {session.role}
              </span>
            </div>

            {session.role === "SUPER_ADMIN" || session.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="px-2.5 py-1.5 bg-deep-charcoal text-warm-ivory text-[10px] font-mono font-bold uppercase rounded-xs hover:bg-muted-olive transition-colors"
              >
                Admin Mode
              </Link>
            ) : null}

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-2 text-deep-charcoal/60 hover:text-red-700 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Horizontal Subnav */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-2.5 overflow-x-auto border-t border-[#EAE5DB] bg-[#FAFAF8] text-xs font-medium">
          {customerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 text-deep-charcoal/80 hover:text-deep-charcoal"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-[#D9D7CF] py-4 text-center text-xs text-deep-charcoal/60 font-mono">
        Arvanta Studio Customer Portal • Butuh bantuan cepat? WhatsApp{" "}
        <a
          href="https://wa.me/62895322465836"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-olive underline font-bold"
        >
          +62 895-3224-65836
        </a>
      </footer>
    </div>
  );
}
