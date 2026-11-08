"use client";

import { useState, useEffect } from "react";
import { Check, X, CreditCard, Download, ExternalLink, RefreshCw } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      // Query orders with payments
      const res = await fetch("/api/orders");
      const data = await res.json();
      const allPayments: any[] = [];
      data.orders?.forEach((o: any) => {
        o.payments?.forEach((p: any) => {
          allPayments.push({ ...p, order: o });
        });
      });
      setPayments(allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (paymentId: string, status: "VERIFIED" | "REJECTED") => {
    if (!confirm(`Konfirmasi ubah status pembayaran menjadi ${status}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });
      if (!res.ok) throw new Error("Gagal memproses verifikasi.");
      fetchPayments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-deep-charcoal">
            Verifikasi Pembayaran & Bukti Transfer
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Tinjau struk transfer bank / QRIS dari pelanggan, verifikasi DP, dan catat pelunasan transaksi.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2 border border-[#D9D7CF] bg-white text-deep-charcoal hover:bg-warm-ivory rounded-xs text-xs font-mono flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                <th className="py-3 px-6">ID Pembayaran</th>
                <th className="py-3 px-6">Order Terkait</th>
                <th className="py-3 px-6">Pelanggan</th>
                <th className="py-3 px-6">Tipe & Metode</th>
                <th className="py-3 px-6">Nominal Transfer</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D7CF]/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-deep-charcoal/60 font-mono">
                    Belum ada catatan pembayaran.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-warm-ivory/50">
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      {p.paymentNumber}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                      <a href={`/admin/orders/${p.order.id}`} className="hover:underline text-muted-olive">
                        {p.order.orderNumber}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-deep-charcoal block">{p.order.customerName}</span>
                      <span className="text-[10px] text-deep-charcoal/60 font-mono">{p.order.customerPhone}</span>
                    </td>
                    <td className="py-4 px-6 font-mono">
                      <span className="font-bold text-deep-charcoal block">{p.paymentType}</span>
                      <span className="text-[10px] text-deep-charcoal/60">{p.method}</span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-deep-charcoal text-sm">
                      Rp{p.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                          p.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {p.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify(p.id, "VERIFIED")}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-800 text-white text-[11px] font-mono uppercase rounded-xs hover:bg-emerald-900 shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Sahkan</span>
                          </button>
                          <button
                            onClick={() => handleVerify(p.id, "REJECTED")}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-red-300 text-red-700 text-[11px] font-mono uppercase rounded-xs hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-deep-charcoal/50">
                          Terverifikasi oleh {p.verifiedBy || "Admin"}
                        </span>
                      )}
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
