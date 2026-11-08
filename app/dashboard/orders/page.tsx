import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, ArrowRight, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersListPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-deep-charcoal">
            Daftar Pesanan Saya
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola dan pantau seluruh transaksi proyek digital Anda di Arvanta Studio.
          </p>
        </div>
        <Link
          href="/order"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
        >
          <span>+ Buat Order Baru</span>
        </Link>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-deep-charcoal/60 font-mono">
            Belum ada pesanan aktif.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                  <th className="py-3.5 px-6">Nomor Order</th>
                  <th className="py-3.5 px-6">Layanan</th>
                  <th className="py-3.5 px-6">Total Biaya</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-warm-ivory/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      <Link href={`/dashboard/orders/${o.orderNumber}`} className="hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-deep-charcoal">
                      {o.items[0]?.name || o.serviceType}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      Rp{o.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-full bg-warm-ivory text-deep-charcoal border border-[#D9D7CF]">
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-deep-charcoal/60 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/dashboard/orders/${o.orderNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-deep-charcoal text-warm-ivory text-[11px] font-mono uppercase rounded-xs hover:bg-muted-olive transition-colors"
                      >
                        <span>Detail</span>
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
