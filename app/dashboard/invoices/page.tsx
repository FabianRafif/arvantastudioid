import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Download, CheckCircle2, Clock, ArrowRight, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerInvoicesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?redirect=/dashboard/invoices");

  const invoices = await prisma.invoice.findMany({
    where: {
      order: {
        userId: session.userId,
      },
    },
    include: {
      order: {
        include: { items: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
          Tagihan & Faktur Pembayaran
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Rincian faktur resmi Down Payment (DP) dan Pelunasan pesanan website Anda.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D9D7CF] rounded-xs space-y-3">
          <FileText className="w-10 h-10 text-muted-olive/50 mx-auto" />
          <h3 className="text-base font-bold text-deep-charcoal">Belum Ada Tagihan</h3>
          <p className="text-xs text-deep-charcoal/60 max-w-sm mx-auto">
            Tagihan akan diterbitkan otomatis setelah Anda membuat pesanan pembuatan website.
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
          >
            <span>Mulai Pesanan Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] border-b border-[#D9D7CF] text-[10px] font-mono uppercase text-deep-charcoal/60">
                <tr>
                  <th className="p-4">Nomor Faktur</th>
                  <th className="p-4">Pesanan Terkait</th>
                  <th className="p-4">Jumlah Tagihan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Jatuh Tempo</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-4">
                      <span className="font-mono font-bold text-xs text-deep-charcoal block">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[10px] font-mono text-deep-charcoal/50">
                        {new Date(inv.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-deep-charcoal block">
                        {inv.order.orderNumber}
                      </span>
                      <span className="text-[11px] text-deep-charcoal/60 line-clamp-1">
                        {inv.order.items?.[0]?.name || "Pembuatan Website"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-sm text-deep-charcoal">
                        Rp{inv.total.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.status === "PAID" ? "Lunas" : "Belum Dibayar"}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-deep-charcoal/70">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("id-ID") : "-"}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <div className="inline-flex rounded-xs border border-[#D9D7CF] bg-warm-ivory text-xs font-mono divide-x divide-[#D9D7CF] shadow-2xs overflow-hidden">
                          <Link
                            href={`/document/${inv.order.orderNumber}?type=invoice`}
                            target="_blank"
                            title="Unduh / Cetak Faktur Invoice"
                            className="px-2.5 py-1.5 text-deep-charcoal hover:bg-white hover:text-black transition-colors"
                          >
                            Invoice
                          </Link>
                          <Link
                            href={`/document/${inv.order.orderNumber}?type=kuitansi`}
                            target="_blank"
                            title="Unduh / Cetak Bukti Kuitansi"
                            className="px-2.5 py-1.5 text-deep-charcoal hover:bg-white hover:text-black transition-colors"
                          >
                            Kuitansi
                          </Link>
                          <Link
                            href={`/document/${inv.order.orderNumber}?type=all`}
                            target="_blank"
                            title="Unduh / Cetak Kedua Dokumen Sekaligus"
                            className="px-2.5 py-1.5 text-deep-charcoal font-bold hover:bg-[#FF9857] hover:text-[#20211F] transition-colors"
                          >
                            Lengkap
                          </Link>
                        </div>
                        <Link
                          href={`/dashboard/orders/${inv.order.orderNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
                        >
                          <span>Detail Order</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
