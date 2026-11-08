import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import PushNotificationManager from "@/components/PushNotificationManager";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [orders, customersCount, payments, waLogs] = await Promise.all([
    prisma.order.findMany({
      include: { items: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.payment.findMany({ where: { status: "VERIFIED" } }),
    prisma.whatsappMessageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: { status: { in: ["PENDING", "MENUNGGU_KONFIRMASI", "MENUNGGU_PEMBAYARAN"] } },
  });
  const inProgressOrders = await prisma.order.count({
    where: { status: { in: ["IN_PROGRESS", "DESIGN_PROCESS", "DEVELOPMENT_PROCESS", "REVISION"] } },
  });
  const completedOrders = await prisma.order.count({
    where: { status: { in: ["COMPLETED", "DELIVERED"] } },
  });

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Studio Overview & Performance
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Pemantauan pesanan, pendapatan transaksi, dan status integrasi real-time.
          </p>
        </div>

        <Link
          href="/order"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
        >
          <span>+ Buat Pesanan Manual</span>
        </Link>
      </div>

      {/* Web Push Banner Component */}
      <PushNotificationManager />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-deep-charcoal/60 font-bold">
              Total Order
            </span>
            <ShoppingBag className="w-4 h-4 text-muted-olive" />
          </div>
          <div className="text-3xl font-display font-bold text-deep-charcoal">
            {totalOrders}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 font-mono block">
            {pendingOrders} butuh konfirmasi
          </span>
        </div>

        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-deep-charcoal/60 font-bold">
              Dalam Pengerjaan
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-display font-bold text-deep-charcoal">
            {inProgressOrders}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 font-mono block">
            Proses koding & desain
          </span>
        </div>

        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-deep-charcoal/60 font-bold">
              Total Pelanggan
            </span>
            <Users className="w-4 h-4 text-deep-charcoal" />
          </div>
          <div className="text-3xl font-display font-bold text-deep-charcoal">
            {customersCount}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 font-mono block">
            Akun klien terdaftar
          </span>
        </div>

        <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-deep-charcoal/60 font-bold">
              Pendapatan Terverifikasi
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-display font-bold text-emerald-800">
            Rp{totalRevenue.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-deep-charcoal/60 font-mono block">
            DP & Pelunasan sah
          </span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#D9D7CF] flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-deep-charcoal">
              Pesanan Terbaru Masuk
            </h3>
            <p className="text-xs text-deep-charcoal/60">
              Pantau brief, ubah status pengerjaan, dan verifikasi berkas pelanggan.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-mono text-muted-olive hover:underline font-bold"
          >
            Lihat Semua Order →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Pelanggan</th>
                <th className="py-3 px-6">Layanan</th>
                <th className="py-3 px-6">Nominal</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Waktu</th>
                <th className="py-3 px-6 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D7CF]/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-deep-charcoal/60 font-mono">
                    Belum ada order masuk.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-warm-ivory/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-deep-charcoal">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-deep-charcoal block">
                        {o.customerName}
                      </span>
                      <span className="text-[10px] text-deep-charcoal/60 font-mono">
                        {o.customerPhone}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-deep-charcoal block font-medium">
                        {o.items[0]?.name || o.serviceType}
                      </span>
                      <span className="text-[10px] text-deep-charcoal/50 font-mono uppercase">
                        {o.serviceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-deep-charcoal">
                      Rp{o.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                          o.status === "COMPLETED" || o.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-deep-charcoal/60">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-deep-charcoal text-warm-ivory text-[10px] font-mono uppercase rounded-xs hover:bg-muted-olive transition-colors"
                      >
                        <span>Kelola</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
