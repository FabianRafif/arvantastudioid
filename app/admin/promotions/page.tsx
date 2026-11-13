"use client";

import { useState, useEffect } from "react";
import { broadcastLiveUpdate } from "@/lib/live-sync";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Percent,
  Clock,
  Copy,
  Check,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minSpend: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minSpend, setMinSpend] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal memuat daftar kupon." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          minSpend: minSpend ? Number(minSpend) : 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat kupon.");
      }

      setFeedback({ type: "success", text: data.message });
      broadcastLiveUpdate();
      setShowModal(false);
      // Reset form
      setCode("");
      setDiscountValue("");
      setMinSpend("");
      setMaxDiscount("");
      setUsageLimit("");
      setStartDate("");
      setEndDate("");
      fetchCoupons();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });
      if (res.ok) {
        broadcastLiveUpdate();
        fetchCoupons();
      }
    } catch {}
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Hapus kupon ${code} secara permanen?`)) return;
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback({ type: "success", text: `Kupon ${code} berhasil dihapus.` });
        broadcastLiveUpdate();
        fetchCoupons();
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Manajemen Promo & Kupon Voucher
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Buat dan atur kode voucher dengan pembatasan kuota penggunaan dan jadwal otomatis server.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kode Voucher Baru</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xs text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9D7CF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Daftar Kupon Voucher
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-olive font-semibold">
            {coupons.length} Kode Terdaftar
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
            Memuat data voucher...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-deep-charcoal/60 space-y-2">
            <p>Belum ada kupon voucher promo yang dibuat.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-muted-olive font-bold underline"
            >
              Terbitkan voucher pertama Anda sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] border-b border-[#D9D7CF] text-[10px] font-mono uppercase text-deep-charcoal/60">
                <tr>
                  <th className="p-4">Kode Voucher</th>
                  <th className="p-4">Nilai Diskon</th>
                  <th className="p-4">Min. Belanja / Maks. Potongan</th>
                  <th className="p-4">Penggunaan / Kuota</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-sm text-deep-charcoal bg-[#F5F2EB] px-2.5 py-1 rounded-xs border border-dashed border-[#D9D7CF]">
                        {c.code}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-deep-charcoal">
                        {c.discountType === "PERCENTAGE"
                          ? `${c.discountValue}%`
                          : `Rp${c.discountValue.toLocaleString("id-ID")}`}
                      </span>
                      <span className="text-[10px] font-mono text-deep-charcoal/50 block">
                        {c.discountType}
                      </span>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="text-[11px] text-deep-charcoal/80">
                        Min: Rp{c.minSpend.toLocaleString("id-ID")}
                      </div>
                      {c.maxDiscount && (
                        <div className="text-[10px] text-deep-charcoal/50 font-mono">
                          Maks: Rp{c.maxDiscount.toLocaleString("id-ID")}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="font-bold text-deep-charcoal">{c.usageCount}</span>
                        <span className="text-deep-charcoal/40">/</span>
                        <span className="text-deep-charcoal/70">
                          {c.usageLimit !== null ? c.usageLimit : "∞"}
                        </span>
                      </div>
                      {c.usageLimit && c.usageCount >= c.usageLimit && (
                        <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                          Kuota Habis
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleCouponStatus(c)}
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {c.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteCoupon(c.id, c.code)}
                        className="p-1.5 text-deep-charcoal/40 hover:text-red-700 transition-colors cursor-pointer"
                        title="Hapus Kupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create Voucher */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#D9D7CF] pb-4">
              <h3 className="text-lg font-display font-bold text-deep-charcoal">
                Buat Kode Voucher Baru
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-deep-charcoal/50 hover:text-deep-charcoal font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Kode Voucher (Huruf Besar & Angka)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: PROMOAKHIRTAHUN"
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Jenis Diskon
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Nilai Diskon ({discountType === "PERCENTAGE" ? "%" : "Rp"})
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "PERCENTAGE" ? "Contoh: 15" : "Contoh: 200000"}
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Minimal Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    placeholder="0 jika tanpa batas"
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Maks. Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Opsional untuk %"
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Batas Penggunaan Total (Kuota)
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Kosongkan jika tanpa batas kuota"
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#D9D7CF] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D9D7CF] text-deep-charcoal font-semibold rounded-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-deep-charcoal text-warm-ivory font-semibold rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50"
                >
                  {submitting ? "Menerbitkan..." : "Terbitkan Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
