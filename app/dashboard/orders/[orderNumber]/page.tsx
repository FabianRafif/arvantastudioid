"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Upload,
  Download,
  MessageCircle,
  FileText,
  Send,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Copy,
  Check,
  Tag,
} from "lucide-react";

const PIPELINE_STATUSES = [
  { key: "PENDING", label: "Pesanan Diterima" },
  { key: "MENUNGGU_KONFIRMASI", label: "Konfirmasi Brief" },
  { key: "MENUNGGU_PEMBAYARAN", label: "Menunggu Pembayaran" },
  { key: "PEMBAYARAN_DIVERIFIKASI", label: "Pembayaran Diverifikasi" },
  { key: "IN_PROGRESS", label: "Sedang Dikerjakan" },
  { key: "REVISION", label: "Tahap Revisi" },
  { key: "COMPLETED", label: "Selesai & Serah Terima" },
];

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Payment upload states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payType, setPayType] = useState<"DP" | "PELUNASAN">("DP");
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER");
  const [payProofFile, setPayProofFile] = useState<File | null>(null);
  const [payUploading, setPayUploading] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  // Revision state
  const [revisionNotes, setRevisionNotes] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // Message chat state
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Promo Coupon Claim state
  const [couponCode, setCouponCode] = useState("");
  const [claimingCoupon, setClaimingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const copyCouponCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(couponCode);
      } else {
        const el = document.createElement("textarea");
        el.value = couponCode;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    } catch {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    }
  };

  const handleClaimCoupon = async () => {
    if (!order || !couponCode.trim()) return;
    setClaimingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CLAIM_PROMO",
          promoCode: couponCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengklaim kupon.");

      await fetchOrderDetail();
      alert("Selamat! Kupon diskon berhasil diklaim dan dipotong dari tagihan Anda.");
    } catch (err: any) {
      setCouponError(err.message || "Gagal menerapkan kupon diskon.");
    } finally {
      setClaimingCoupon(false);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat detail pesanan.");
      setOrder(data.order);
      setPayAmount(data.order.dpAmount || Math.round(data.order.totalAmount * 0.5));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();

    // Cross-tab real-time sync with BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("arvanta_live_sync");
        channel.onmessage = () => {
          fetchOrderDetail();
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "arvanta_live_sync_trigger") {
        fetchOrderDetail();
      }
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      fetchOrderDetail();
    }, 4000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [orderNumber]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setPayUploading(true);
    setPaySuccessMsg("");

    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      fd.append("amount", String(payAmount));
      fd.append("paymentType", payType);
      fd.append("method", payMethod);
      if (payProofFile) {
        fd.append("proof", payProofFile);
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah bukti pembayaran.");

      setPaySuccessMsg(data.message);
      setPayProofFile(null);
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPayUploading(false);
    }
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !revisionNotes) return;
    setSubmittingRevision(true);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_REVISION",
          revisionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengajukan revisi.");

      setRevisionNotes("");
      setShowRevisionForm(false);
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newMessage.trim()) return;
    setSendingMsg(true);

    try {
      const res = await fetch(`/api/orders/${order.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim pesan.");

      setNewMessage("");
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-deep-charcoal/60">
        Memuat detail pesanan {orderNumber}...
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-deep-charcoal">Pesanan Tidak Ditemukan</h3>
        <p className="text-xs text-deep-charcoal/60">{errorMsg || "ID tidak valid."}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs rounded-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    );
  }

  // Calculate current pipeline index
  const currentStatusIndex = PIPELINE_STATUSES.findIndex((p) => p.key === order.status);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-deep-charcoal/60 hover:text-deep-charcoal mb-2 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Ringkasan</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
              Order #{order.orderNumber}
            </h1>
            <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-full bg-deep-charcoal text-warm-ivory">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <span className="text-xs text-deep-charcoal/60 font-mono">
            Dibuat pada {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrderDetail}
            className="p-2 border border-[#D9D7CF] text-deep-charcoal hover:bg-white rounded-xs text-xs font-mono flex items-center gap-1"
            title="Refresh status terkini"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <a
            href={`https://wa.me/62895322465836?text=Halo%20Admin%20Arvanta,%20saya%20ingin%20menanyakan%20progres%20order%20nomor%20${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors rounded-xs flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Admin</span>
          </a>
        </div>
      </div>

      {/* Visual Pipeline Stepper */}
      <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-olive font-bold block">
          Tahapan Pengerjaan Proyek Anda
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PIPELINE_STATUSES.map((step, idx) => {
            const isCompleted = currentStatusIndex >= idx;
            const isCurrent = order.status === step.key;

            return (
              <div
                key={step.key}
                className={`p-3 border rounded-xs text-xs flex flex-col justify-between ${
                  isCurrent
                    ? "bg-deep-charcoal text-warm-ivory border-deep-charcoal font-bold"
                    : isCompleted
                    ? "bg-warm-ivory text-deep-charcoal border-muted-olive/50 font-medium"
                    : "bg-white text-deep-charcoal/40 border-[#D9D7CF]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono">0{idx + 1}</span>
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-muted-olive" />}
                </div>
                <span className="text-[11px] leading-tight">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Order Details & Deliverables */}
        <div className="lg:col-span-7 space-y-8">
          {/* Deliverables Box */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-olive" />
                <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
                  Hasil Serah Terima File (Deliverables)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-deep-charcoal/60">
                {order.files.filter((f: any) => f.fileCategory === "DELIVERABLE").length} File Siap Unduh
              </span>
            </div>

            {order.files.filter((f: any) => f.fileCategory === "DELIVERABLE").length === 0 ? (
              <div className="p-6 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-center text-xs text-deep-charcoal/60">
                File hasil desain atau akses website live belum diunggah oleh admin. Tim kami sedang mengerjakan proyek Anda sesuai brief.
              </div>
            ) : (
              <div className="space-y-2">
                {order.files
                  .filter((f: any) => f.fileCategory === "DELIVERABLE")
                  .map((file: any) => (
                    <div
                      key={file.id}
                      className="p-3.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-muted-olive shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-deep-charcoal block truncate">
                            {file.originalName}
                          </span>
                          <span className="text-[10px] text-deep-charcoal/60 font-mono">
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.fileType}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`/api/files/${file.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-deep-charcoal text-warm-ivory text-[11px] font-mono font-bold uppercase rounded-xs hover:bg-muted-olive transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
              </div>
            )}

            {/* Revision Request Button */}
            <div className="pt-2">
              {!showRevisionForm ? (
                <button
                  type="button"
                  onClick={() => setShowRevisionForm(true)}
                  className="w-full py-2.5 border border-deep-charcoal text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                >
                  Ajukan Revisi Proyek
                </button>
              ) : (
                <form onSubmit={handleRevisionSubmit} className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-deep-charcoal">
                    Rincian Hal yang Ingin Direvisi:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    placeholder="Tuliskan bagian teks, warna, penataan layout, atau fitur yang ingin disesuaikan..."
                    className="w-full p-3 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRevisionForm(false)}
                      className="px-3.5 py-2 text-xs text-deep-charcoal/70 hover:text-deep-charcoal"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingRevision}
                      className="px-5 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs disabled:opacity-50"
                    >
                      {submittingRevision ? "Mengirim..." : "Kirim Pengajuan Revisi"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Requirement Brief Specifications */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2">
              Rincian Kebutuhan & Brief Proyek
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase">
                  Jenis Layanan:
                </span>
                <span className="font-semibold text-deep-charcoal">
                  {order.serviceType === "WEBSITE" ? "Website Development" : "Graphic Design"}
                </span>
              </div>

              <div>
                <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase">
                  Paket / Produk:
                </span>
                <span className="font-semibold text-deep-charcoal">
                  {order.items[0]?.name || "Kustom"}
                </span>
              </div>

              {order.businessName && (
                <div>
                  <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase">
                    Nama Bisnis / Brand:
                  </span>
                  <span className="font-semibold text-deep-charcoal">{order.businessName}</span>
                </div>
              )}

              {order.websiteType && (
                <div>
                  <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase">
                    Tipe Website:
                  </span>
                  <span className="font-semibold text-deep-charcoal">{order.websiteType}</span>
                </div>
              )}

              {order.designSize && (
                <div>
                  <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase">
                    Dimensi Desain:
                  </span>
                  <span className="font-semibold text-deep-charcoal">{order.designSize}</span>
                </div>
              )}

              {order.deadline && (
                <div>
                  <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase">
                    Ekspektasi Deadline:
                  </span>
                  <span className="font-semibold text-deep-charcoal font-mono">
                    {new Date(order.deadline).toLocaleDateString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#D9D7CF]/60 text-xs">
              <span className="text-deep-charcoal/60 block font-mono text-[10px] uppercase mb-1">
                Catatan Klien:
              </span>
              <p className="p-3 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-deep-charcoal/80 leading-relaxed font-mono whitespace-pre-wrap">
                {(() => {
                  const raw = order.notes || "";
                  const cleaned = raw.includes("--- SNAPSHOT HARGA TERKUNCI ---")
                    ? raw.split("--- SNAPSHOT HARGA TERKUNCI ---")[0].trim()
                    : raw.trim();
                  return cleaned && cleaned !== "-" ? cleaned : "-";
                })()}
              </p>
            </div>
          </div>

          {/* Interactive Chat / Notes with Admin */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2">
              Pesan & Catatan Diskusi dengan Tim Arvanta
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {order.messages.length === 0 ? (
                <div className="p-4 text-center text-xs text-deep-charcoal/50 font-mono">
                  Belum ada pesan. Anda dapat menulis pertanyaan atau catatan di bawah.
                </div>
              ) : (
                order.messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xs text-xs space-y-1 ${
                      msg.senderRole === "ADMIN"
                        ? "bg-muted-olive/10 border-l-4 border-l-muted-olive ml-4"
                        : "bg-warm-ivory border border-[#D9D7CF] mr-4"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-deep-charcoal/60">
                      <span className="font-bold">
                        {msg.senderRole === "ADMIN" ? "Studio Admin (Arvanta)" : "Anda"}
                      </span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-deep-charcoal leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pesan untuk tim desainer..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="px-4 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Payment & Bank Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Financial Invoice Card */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2 flex items-center justify-between">
              <span>Status Pembayaran</span>
              <CreditCard className="w-4 h-4 text-muted-olive" />
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-deep-charcoal/70">Total Biaya Jasa:</span>
                <span className="font-bold text-deep-charcoal text-sm">
                  Rp{order.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-deep-charcoal/70">Nominal Down Payment (DP):</span>
                <span className="font-bold text-muted-olive">
                  Rp{order.dpAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#D9D7CF] pt-2">
                <span className="text-deep-charcoal/70">Sisa Pelunasan:</span>
                <span className="font-bold text-deep-charcoal">
                  Rp{order.remainingAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Promo Coupon Claim & Copy Section */}
            {order.notes?.includes("[KUPON:") || order.notes?.includes("Klaim Kupon") ? (
              <div className="p-3 bg-muted-olive/15 border border-muted-olive/40 rounded-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-olive shrink-0" />
                  <div>
                    <span className="font-bold text-deep-charcoal block">Kupon Promo Diterapkan</span>
                    <span className="text-[11px] text-deep-charcoal/70">Potongan harga promo telah dipotong dari total biaya jasa.</span>
                  </div>
                </div>
              </div>
            ) : order.status !== "COMPLETED" && order.status !== "DELIVERED" ? (
              <div className="p-3.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-muted-olive" />
                    <span className="text-xs font-bold text-deep-charcoal uppercase tracking-wider font-mono">
                      Klaim Kupon Diskon Promo
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyCouponCode}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-olive hover:underline cursor-pointer select-none"
                    title="Klik untuk menyalin kupon"
                  >
                    {copiedCoupon ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Tersalin!</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5">
                        <Copy className="w-3 h-3" />
                        <span>Salin Kupon</span>
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ARVANTA1111"
                    className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-[#D9D7CF] rounded-xs uppercase tracking-wider focus:outline-hidden focus:border-deep-charcoal"
                  />
                  <button
                    type="button"
                    onClick={handleClaimCoupon}
                    disabled={claimingCoupon || !couponCode.trim()}
                    className="px-3.5 py-1.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {claimingCoupon ? "Memproses..." : "Klaim Diskon"}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-red-600 font-mono">{couponError}</p>
                )}
              </div>
            ) : null}

            {/* Bank Accounts */}
            <div className="p-4 bg-warm-ivory border border-[#D9D7CF] rounded-xs space-y-2 text-xs font-mono">
              <span className="font-bold text-deep-charcoal block">Rekening Resmi Pembayaran:</span>
              <div className="space-y-1 text-deep-charcoal/80">
                <div>• Bank Central Asia (BCA): <span className="font-bold">0461829381</span> (a.n Arvanta Studio)</div>
                <div>• Bank Mandiri: <span className="font-bold">1390028192811</span> (a.n Arvanta Studio)</div>
                <div>• QRIS Seluruh Bank & E-Wallet: Tersedia via WhatsApp</div>
              </div>
            </div>

            {paySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xs">
                {paySuccessMsg}
              </div>
            )}

            {/* Upload Payment Proof Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-deep-charcoal block">
                Unggah Bukti Pembayaran:
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-1.5 p-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs cursor-pointer">
                  <input
                    type="radio"
                    name="ptype"
                    checked={payType === "DP"}
                    onChange={() => {
                      setPayType("DP");
                      setPayAmount(order.dpAmount);
                    }}
                  />
                  <span>Bayar DP (50%)</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs cursor-pointer">
                  <input
                    type="radio"
                    name="ptype"
                    checked={payType === "PELUNASAN"}
                    onChange={() => {
                      setPayType("PELUNASAN");
                      setPayAmount(order.remainingAmount || order.totalAmount);
                    }}
                  />
                  <span>Pelunasan Sisa</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-deep-charcoal mb-1">
                  Nominal Transfer (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value || "0", 10))}
                  className="w-full px-3 py-2 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-deep-charcoal mb-1">
                  File Struk / Screenshot Transfer (JPG, PNG, PDF)
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setPayProofFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-deep-charcoal file:mr-3 file:py-1 file:px-2 file:border-0 file:text-[11px] file:bg-deep-charcoal file:text-warm-ivory rounded-xs"
                />
              </div>

              <button
                type="submit"
                disabled={payUploading || !payProofFile}
                className="w-full py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50 mt-2"
              >
                {payUploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
              </button>
            </form>

            {/* Payment Proof History */}
            {order.payments?.length > 0 && (
              <div className="pt-3 border-t border-[#D9D7CF]/60 space-y-2">
                <span className="text-[10px] font-mono uppercase text-deep-charcoal/60 font-bold block">
                  Riwayat Pembayaran Anda:
                </span>
                {order.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs font-mono flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-deep-charcoal block">
                        {p.paymentType} — Rp{p.amount.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[10px] text-deep-charcoal/60">
                        {p.paymentNumber} • {new Date(p.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        p.status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
