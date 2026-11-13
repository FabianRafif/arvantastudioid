import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BannerCarousel from "@/components/BannerCarousel";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: true,
      payments: true,
      files: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const activeOrders = orders.filter((o) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(o.status));
  const completedOrders = orders.filter((o) => ["COMPLETED", "DELIVERED"].includes(o.status));

  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 bg-white border border-[#D9D7CF] rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-muted-olive font-bold">
            Portal Klien Arvanta Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal mt-1">
            Selamat Datang, {session.fullName}
          </h1>
          <p className="text-xs text-deep-charcoal/70 mt-1">
            Pantau progres pembuatan website, desain grafis, pembayaran DP, dan hasil serah terima proyek Anda di sini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/order"
            className="px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs"
          >
            + Pesan Layanan Baru
          </Link>
          <a
            href="https://wa.me/62895322465836"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-[#D9D7CF] text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:border-deep-charcoal transition-colors rounded-xs flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-muted-olive" />
            <span>Chat Admin</span>
          </a>
        </div>
      </div>

      {/* Prominent Studio Banner Carousel (160 x 60 cm) */}
      <BannerCarousel initialBanners={banners} showHeader={false} compact={true} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-deep-charcoal/60">
              Total Pesanan
            </span>
            <ShoppingBag className="w-4 h-4 text-muted-olive" />
          </div>
          <div className="text-3xl font-display font-bold text-deep-charcoal">
            {orders.length}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 block font-mono">
            Seluruh riwayat pemesanan Anda
          </span>
        </div>

        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-deep-charcoal/60">
              Sedang Dikerjakan
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-display font-bold text-deep-charcoal">
            {activeOrders.length}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 block font-mono">
            Tahap desain, koding, atau revisi
          </span>
        </div>

        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-deep-charcoal/60">
              Selesai & Diserahkan
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-display font-bold text-deep-charcoal">
            {completedOrders.length}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 block font-mono">
            File master & website live
          </span>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#D9D7CF] flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-deep-charcoal">
              Riwayat Pesanan Anda
            </h3>
            <p className="text-xs text-deep-charcoal/60">
              Klik nomor order untuk melihat rincian proses, upload bukti pembayaran, dan download hasil file.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-deep-charcoal/30 mx-auto" />
            <h4 className="text-sm font-semibold text-deep-charcoal">Belum Ada Pesanan</h4>
            <p className="text-xs text-deep-charcoal/60 max-w-sm mx-auto">
              Anda belum melakukan pemesanan website maupun desain grafis. Mulai buat proyek pertama Anda bersama Arvanta Studio.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs"
            >
              <span>Buat Order Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                  <th className="py-3.5 px-6">Nomor Order</th>
                  <th className="py-3.5 px-6">Layanan</th>
                  <th className="py-3.5 px-6">Total Biaya</th>
                  <th className="py-3.5 px-6">Status Pengerjaan</th>
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-warm-ivory/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      <Link
                        href={`/dashboard/orders/${o.orderNumber}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <span>{o.orderNumber}</span>
                        <ExternalLink className="w-3 h-3 text-deep-charcoal/40" />
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-deep-charcoal">
                        {o.items[0]?.name || o.serviceType}
                      </div>
                      <span className="text-[10px] text-deep-charcoal/60 font-mono">
                        {o.serviceType === "WEBSITE" ? "Website Development" : "Graphic Design"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      Rp{o.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-full ${
                          o.status === "COMPLETED" || o.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "IN_PROGRESS" || o.status === "DEVELOPMENT_PROCESS" || o.status === "DESIGN_PROCESS"
                            ? "bg-blue-100 text-blue-800"
                            : o.status === "REVISION"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-deep-charcoal/60 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/dashboard/orders/${o.orderNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] text-deep-charcoal text-[11px] font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                      >
                        <span>Pantau</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
