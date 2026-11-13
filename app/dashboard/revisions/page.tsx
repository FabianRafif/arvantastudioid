import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RotateCcw, Plus, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerRevisionsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?redirect=/dashboard/revisions");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
          Pusat Pengajuan & Pelacakan Revisi
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Ajukan perbaikan desain atau konten website Anda secara transparan sesuai kuota paket layanan.
        </p>
      </div>

      <div className="bg-white border border-[#D9D7CF] p-6 rounded-xs space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-muted-olive" />
          <h2 className="text-sm font-bold text-deep-charcoal">
            Pedoman Pengajuan Revisi
          </h2>
        </div>
        <p className="text-xs text-deep-charcoal/70 leading-relaxed max-w-2xl">
          Setiap paket memiliki kuota revisi gratis (2x hingga 5x putaran). Pengajuan revisi dilakukan langsung pada halaman detail masing-masing nomor pesanan agar terdokumentasi rapi bersama riwayat file pengerjaan.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-deep-charcoal">
          Pilih Pesanan untuk Mengajukan Revisi:
        </h3>

        {orders.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#D9D7CF] rounded-xs space-y-3">
            <Clock className="w-8 h-8 text-muted-olive/50 mx-auto" />
            <p className="text-xs text-deep-charcoal/60">
              Anda belum memiliki pesanan aktif untuk mengajukan revisi.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
            >
              <span>Mulai Order Baru</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white border border-[#D9D7CF] p-6 rounded-xs shadow-2xs hover:border-deep-charcoal transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs bg-[#F5F2EB] px-2 py-0.5 rounded-xs border border-[#D9D7CF]">
                      {o.orderNumber}
                    </span>
                    <span className="text-[10px] font-mono text-muted-olive font-bold uppercase">
                      {o.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-deep-charcoal">
                    {o.items?.[0]?.name || "Proyek Website"}
                  </h4>

                  <p className="text-xs text-deep-charcoal/60">
                    {o.businessName || o.customerName}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#D9D7CF]/60 mt-6">
                  <Link
                    href={`/dashboard/orders/${o.orderNumber}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
                  >
                    <span>Buka Lembar Revisi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
