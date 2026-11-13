import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowRight, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerMessagesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?redirect=/dashboard/messages");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
          Pusat Komunikasi & Percakapan
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Saluran komunikasi resmi antara Anda dan tim teknis Arvanta Studio per nomor pesanan.
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#D9D7CF] rounded-xs space-y-3">
            <MessageSquare className="w-10 h-10 text-muted-olive/50 mx-auto" />
            <h3 className="text-base font-bold text-deep-charcoal">Belum Ada Percakapan</h3>
            <p className="text-xs text-deep-charcoal/60 max-w-sm mx-auto">
              Percakapan akan aktif otomatis begitu Anda membuat pesanan baru.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
            >
              <span>Mulai Order Baru</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#D9D7CF]/60 bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
            {orders.map((o) => {
              const lastMsg = o.messages[0];
              return (
                <div
                  key={o.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#F5F2EB] px-2 py-0.5 rounded-xs border border-[#D9D7CF]">
                        {o.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-deep-charcoal">
                        {o.items?.[0]?.name || "Proyek Website"}
                      </span>
                    </div>

                    <p className="text-xs text-deep-charcoal/70 line-clamp-1">
                      {lastMsg ? lastMsg.message : "Belum ada pesan baru. Klik untuk mulai berdiskusi."}
                    </p>

                    {lastMsg && (
                      <span className="text-[10px] font-mono text-muted-olive block">
                        Pesan terakhir: {new Date(lastMsg.createdAt).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/orders/${o.orderNumber}#chat`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Buka Ruang Diskusi</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
