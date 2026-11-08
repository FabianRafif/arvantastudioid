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
} from "lucide-react";
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

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col text-deep-charcoal">
      {/* Dashboard Topbar */}
      <header className="bg-white border-b border-[#D9D7CF] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-deep-charcoal text-warm-ivory flex items-center justify-center text-sm font-bold tracking-tight rounded-xs">
                A
              </span>
              <span className="text-base font-bold font-display uppercase tracking-tight text-deep-charcoal">
                Arvanta<span className="text-muted-olive">.</span>Portal
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
              <Link
                href="/dashboard"
                className="text-deep-charcoal hover:text-muted-olive transition-colors py-1"
              >
                Ringkasan
              </Link>
              <Link
                href="/dashboard/orders"
                className="text-deep-charcoal/70 hover:text-deep-charcoal transition-colors py-1"
              >
                Pesanan Saya
              </Link>
              <Link
                href="/order"
                className="text-muted-olive hover:text-deep-charcoal transition-colors py-1 flex items-center gap-1"
              >
                <span>+ Order Baru</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
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
                className="px-2.5 py-1.5 bg-deep-charcoal text-warm-ivory text-[10px] font-mono font-bold uppercase rounded-xs"
              >
                Admin Mode
              </Link>
            ) : null}

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-2 text-deep-charcoal/60 hover:text-red-700 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
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
