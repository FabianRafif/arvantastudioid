import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, ArrowRight, ExternalLink, Search, Filter, Printer, FileText } from "lucide-react";
import AdminOrdersLiveWatcher from "@/components/admin/AdminOrdersLiveWatcher";

export const dynamic = "force-dynamic";

export default async function AdminOrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } },
      { customerPhone: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  const statuses = [
    { key: "ALL", label: "Semua Status" },
    { key: "PENDING", label: "Pending" },
    { key: "MENUNGGU_KONFIRMASI", label: "Menunggu Konfirmasi" },
    { key: "MENUNGGU_PEMBAYARAN", label: "Menunggu Pembayaran" },
    { key: "PEMBAYARAN_DIVERIFIKASI", label: "Pembayaran Terverifikasi" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "REVISION", label: "Revisi" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ];

  return (
    <div className="space-y-6">
      <AdminOrdersLiveWatcher />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-deep-charcoal">
            Order Management Console
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola seluruh alur pesanan website dan desain grafis secara real-time.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {statuses.map((s) => (
          <Link
            key={s.key}
            href={`/admin/orders?status=${s.key}${q ? `&q=${q}` : ""}`}
            className={`px-3 py-1.5 rounded-xs border transition-colors ${
              (status || "ALL") === s.key
                ? "bg-deep-charcoal text-warm-ivory border-deep-charcoal font-bold"
                : "bg-white text-deep-charcoal/70 border-[#D9D7CF] hover:border-deep-charcoal"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Pelanggan</th>
                <th className="py-3.5 px-6">Layanan / Produk</th>
                <th className="py-3.5 px-6">Total Biaya</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Waktu Masuk</th>
                <th className="py-3.5 px-6 text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D7CF]/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-deep-charcoal/60 font-mono">
                    Tidak ada pesanan ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-warm-ivory/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-deep-charcoal block">
                        {o.customerName}
                      </span>
                      <span className="text-[10px] text-deep-charcoal/60 font-mono">
                        {o.customerPhone}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-deep-charcoal block">
                        {o.items[0]?.name || o.serviceType}
                      </span>
                      <span className="text-[10px] text-deep-charcoal/50 font-mono uppercase">
                        {o.serviceType}
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
                            : o.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : o.status === "REVISION"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-deep-charcoal/60 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="inline-flex rounded-xs border border-[#D9D7CF] bg-warm-ivory text-[11px] font-mono divide-x divide-[#D9D7CF] shadow-2xs overflow-hidden">
                          <Link
                            href={`/admin/orders/${o.id}/document?type=invoice`}
                            target="_blank"
                            title="Unduh / Cetak Faktur Invoice Saja"
                            className="px-2 py-1 text-deep-charcoal hover:bg-white hover:text-black transition-colors"
                          >
                            Inv
                          </Link>
                          <Link
                            href={`/admin/orders/${o.id}/document?type=kuitansi`}
                            target="_blank"
                            title="Unduh / Cetak Bukti Kuitansi Saja"
                            className="px-2 py-1 text-deep-charcoal hover:bg-white hover:text-black transition-colors"
                          >
                            Kui
                          </Link>
                          <Link
                            href={`/admin/orders/${o.id}/document?type=all`}
                            target="_blank"
                            title="Unduh / Cetak Semua Dokumen Resmi"
                            className="px-2 py-1 text-deep-charcoal font-bold hover:bg-[#FF9857] hover:text-[#20211F] transition-colors"
                          >
                            Lengkap
                          </Link>
                        </div>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-deep-charcoal text-warm-ivory text-[11px] font-mono uppercase rounded-xs hover:bg-muted-olive transition-colors"
                        >
                          <span>Kelola</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
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
