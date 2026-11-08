import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, ShoppingBag, ExternalLink, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl font-display font-bold text-deep-charcoal">
          Database Pelanggan & Klien
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Daftar seluruh akun pelanggan yang terdaftar di Arvanta Studio beserta riwayat pesanan.
        </p>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                <th className="py-3.5 px-6">Nama Pelanggan</th>
                <th className="py-3.5 px-6">Username</th>
                <th className="py-3.5 px-6">WhatsApp</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Total Order</th>
                <th className="py-3.5 px-6">Terdaftar Sejak</th>
                <th className="py-3.5 px-6 text-right">Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D7CF]/60">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-deep-charcoal/60 font-mono">
                    Belum ada pelanggan terdaftar.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const cleanPhone = c.phone.replace(/\D/g, "");
                  const waLink = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}`;

                  return (
                    <tr key={c.id} className="hover:bg-warm-ivory/50">
                      <td className="py-4 px-6 font-bold text-deep-charcoal">
                        {c.fullName}
                      </td>
                      <td className="py-4 px-6 font-mono text-muted-olive font-bold">
                        @{c.username}
                      </td>
                      <td className="py-4 px-6 font-mono text-deep-charcoal">
                        {c.phone}
                      </td>
                      <td className="py-4 px-6 font-mono text-deep-charcoal/70">
                        {c.email}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                        {c.orders.length} Pesanan
                      </td>
                      <td className="py-4 px-6 font-mono text-deep-charcoal/60 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-800 text-white text-[11px] font-mono uppercase rounded-xs hover:bg-emerald-900 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
