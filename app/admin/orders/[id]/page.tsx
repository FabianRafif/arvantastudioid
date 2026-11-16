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
  Save,
  CreditCard,
  User,
  Shield,
  Trash2,
  Printer,
  Receipt,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import { generateInvoiceNumber, generateKuitansiNumber } from "@/lib/documents";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit fields
  const [status, setStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [dpAmount, setDpAmount] = useState(0);
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Deliverables upload
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);

  // Message
  const [adminMessage, setAdminMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat detail pesanan.");
      setOrder(data.order);
      setStatus(data.order.status);
      setTotalAmount(data.order.totalAmount);
      setDpAmount(data.order.dpAmount);
      setInternalNotes(data.order.internalNotes || "");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // 1. Cross-tab real-time sync with BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("arvanta_live_sync");
        channel.onmessage = () => {
          fetchOrder();
        };
      }
    } catch {}

    // 2. Storage event listener (multi-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "arvanta_live_sync_trigger") {
        fetchOrder();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Periodic polling (every 4 seconds) for real-time updates across devices
    const interval = setInterval(() => {
      fetchOrder();
    }, 4000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [id]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          statusNotes,
          totalAmount,
          dpAmount,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      setStatusNotes("");
      alert("Perubahan order berhasil disimpan!");
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableFile || !order) return;
    setUploadingDeliverable(true);

    try {
      const fd = new FormData();
      fd.append("file", deliverableFile);
      fd.append("orderId", order.id);
      fd.append("category", "DELIVERABLE");

      // Upload via internal deliverable route or orders route
      const res = await fetch(`/api/orders/${order.id}/deliverables`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah berkas serah terima.");

      alert("Berkas hasil pengerjaan berhasil diunggah!");
      setDeliverableFile(null);
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingDeliverable(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim() || !order) return;
    setSendingMsg(true);

    try {
      const res = await fetch(`/api/orders/${order.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: adminMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim pesan.");

      setAdminMessage("");
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center font-mono text-xs text-deep-charcoal/60">Memuat detail pesanan...</div>;
  }

  if (errorMsg || !order) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-deep-charcoal">Pesanan Tidak Ditemukan</h3>
        <Link href="/admin/orders" className="text-xs text-muted-olive underline font-mono">
          Kembali ke Daftar Order
        </Link>
      </div>
    );
  }

  const customerCleanPhone = order.customerPhone?.replace(/\D/g, "");
  const formattedWaPhone = customerCleanPhone?.startsWith("0") ? "62" + customerCleanPhone.slice(1) : customerCleanPhone;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://arvantastudioid.vercel.app";
  const docAllLink = `${baseUrl}/document/${order.orderNumber}?type=all`;
  const docInvLink = `${baseUrl}/document/${order.orderNumber}?type=invoice`;
  const docKuiLink = `${baseUrl}/document/${order.orderNumber}?type=kuitansi`;

  const waText = encodeURIComponent(
`Halo kak ${order.customerName}, berikut berkas resmi Faktur Tagihan (Invoice) & Kuitansi Pembayaran untuk pesanan Anda di Arvanta Studio:

*DETAIL PESANAN:*
• No. Order: ${order.orderNumber}
• Status: ${order.status.replace(/_/g, " ")}
• Total: Rp ${Number(order.totalAmount || 0).toLocaleString("id-ID")}

*UNDUH BERKAS RESMI (LANGSUNG TANPA LOGIN):*
• Dokumen Lengkap (Semua): ${docAllLink}
• Khusus Invoice: ${docInvLink}
• Khusus Kuitansi: ${docKuiLink}

Dokumen dapat langsung dibuka dan disimpan sebagai PDF. Terima kasih telah mempercayakan proyek Anda kepada Arvanta Studio!`
  );

  const waCustomerLink = `https://wa.me/${formattedWaPhone}?text=${waText}`;

  const handleCopyDocLink = () => {
    navigator.clipboard.writeText(docAllLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-deep-charcoal/60 hover:text-deep-charcoal mb-2 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Order</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
              Order #{order.orderNumber}
            </h1>
            <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-full bg-deep-charcoal text-warm-ivory">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Document Download & Print Options Separated for Admin */}
          <div className="inline-flex rounded-xs border border-[#D9D7CF] bg-white shadow-2xs overflow-hidden text-xs font-mono">
            <Link
              href={`/admin/orders/${order.id}/document?type=invoice`}
              target="_blank"
              title="Cetak Faktur Tagihan (Invoice) Saja"
              className="px-3 py-2 hover:bg-warm-ivory text-deep-charcoal border-r border-[#D9D7CF] flex items-center gap-1.5 transition-colors font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-[#FF9857]" />
              <span>Invoice</span>
            </Link>
            <Link
              href={`/admin/orders/${order.id}/document?type=kuitansi`}
              target="_blank"
              title="Cetak Bukti Pembayaran (Kuitansi) Saja"
              className="px-3 py-2 hover:bg-warm-ivory text-deep-charcoal border-r border-[#D9D7CF] flex items-center gap-1.5 transition-colors font-medium"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kuitansi</span>
            </Link>
            <Link
              href={`/admin/orders/${order.id}/document?type=all`}
              target="_blank"
              title="Cetak Kedua Dokumen Sekaligus"
              className="px-3 py-2 bg-[#FF9857] text-[#20211F] font-bold flex items-center gap-1.5 hover:bg-[#e07f40] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Semua Dokumen</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleCopyDocLink}
            title="Salin tautan invoice & kuitansi klien"
            className="px-3 py-2 bg-warm-ivory border border-[#D9D7CF] text-deep-charcoal text-xs font-mono rounded-xs hover:border-deep-charcoal hover:bg-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#FF9857]" />}
            <span>{copiedLink ? "Link Tersalin!" : "Salin Link"}</span>
          </button>

          <a
            href={waCustomerLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Kirim notifikasi & link struk invoice langsung via WhatsApp"
            className="px-3.5 py-2 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors rounded-xs flex items-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col (7 cols): Details, Files, Deliverables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Requirement Summary */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2">
              Informasi Pelanggan & Spesifikasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-deep-charcoal/60 block text-[10px] uppercase">Nama:</span>
                <span className="font-bold text-deep-charcoal text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-deep-charcoal/60 block text-[10px] uppercase">WhatsApp:</span>
                <span className="font-bold text-deep-charcoal">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-deep-charcoal/60 block text-[10px] uppercase">Email:</span>
                <span className="text-deep-charcoal">{order.customerEmail || "-"}</span>
              </div>
              <div>
                <span className="text-deep-charcoal/60 block text-[10px] uppercase">Layanan:</span>
                <span className="font-bold text-deep-charcoal">{order.serviceType}</span>
              </div>
              {order.businessName && (
                <div>
                  <span className="text-deep-charcoal/60 block text-[10px] uppercase">Bisnis:</span>
                  <span className="text-deep-charcoal font-bold">{order.businessName}</span>
                </div>
              )}
              {order.websiteType && (
                <div>
                  <span className="text-deep-charcoal/60 block text-[10px] uppercase">Jenis Website:</span>
                  <span className="text-deep-charcoal">{order.websiteType}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#D9D7CF]/60 text-xs">
              <span className="text-deep-charcoal/60 block text-[10px] font-mono uppercase mb-1">
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

          {/* Reference Files Uploaded by Customer */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-2">
              <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
                Berkas & Foto Referensi dari Pelanggan
              </h3>
              <span className="text-[10px] font-mono text-deep-charcoal/60">
                {order.files.filter((f: any) => f.fileCategory === "REFERENCE").length} Berkas
              </span>
            </div>

            {order.files.filter((f: any) => f.fileCategory === "REFERENCE").length === 0 ? (
              <div className="p-4 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-center text-xs text-deep-charcoal/60 font-mono">
                Tidak ada file lampiran dari pelanggan.
              </div>
            ) : (
              <div className="space-y-2">
                {order.files
                  .filter((f: any) => f.fileCategory === "REFERENCE")
                  .map((f: any) => (
                    <div
                      key={f.id}
                      className="p-3 bg-warm-ivory border border-[#D9D7CF] rounded-xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-bold text-deep-charcoal block truncate">{f.originalName}</span>
                        <span className="text-[10px] text-deep-charcoal/60 font-mono">
                          {(f.fileSize / 1024 / 1024).toFixed(2)} MB • {f.fileType}
                        </span>
                      </div>
                      <a
                        href={`/api/files/${f.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-deep-charcoal text-warm-ivory text-[10px] font-mono uppercase rounded-xs hover:bg-muted-olive transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>Unduh File</span>
                      </a>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Deliverables Section: Upload Finished File */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-2">
              <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
                Serah Terima Berkas Proyek (Deliverables)
              </h3>
              <span className="text-[10px] font-mono text-emerald-800 font-bold">
                Klien Dapat Mengunduh
              </span>
            </div>

            {order.files.filter((f: any) => f.fileCategory === "DELIVERABLE").length > 0 && (
              <div className="space-y-2">
                {order.files
                  .filter((f: any) => f.fileCategory === "DELIVERABLE")
                  .map((f: any) => (
                    <div
                      key={f.id}
                      className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-bold text-emerald-900 block truncate">{f.originalName}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          {(f.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <a
                        href={`/api/files/${f.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-800 text-white text-[10px] font-mono uppercase rounded-xs"
                      >
                        Unduh
                      </a>
                    </div>
                  ))}
              </div>
            )}

            {/* Upload Deliverable File Form */}
            <form onSubmit={handleUploadDeliverable} className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-deep-charcoal">
                Unggah File Hasil (Vector Master / ZIP / PDF / Credentials):
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  required
                  onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                  className="flex-1 text-xs text-deep-charcoal file:mr-3 file:py-1.5 file:px-2.5 file:border-0 file:text-[11px] file:bg-deep-charcoal file:text-warm-ivory rounded-xs"
                />
                <button
                  type="submit"
                  disabled={uploadingDeliverable || !deliverableFile}
                  className="px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs disabled:opacity-50"
                >
                  {uploadingDeliverable ? "Mengunggah..." : "Serahkan File"}
                </button>
              </div>
            </form>
          </div>

          {/* Discussion Chat with Customer */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2">
              Pesan & Diskusi dengan Pelanggan
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {order.messages.map((msg: any) => (
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
                      {msg.senderRole === "ADMIN" ? "Studio Admin (Anda)" : order.customerName}
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-deep-charcoal leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
              <input
                type="text"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Tulis pesan resmi kepada pelanggan..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              />
              <button
                type="submit"
                disabled={sendingMsg || !adminMessage.trim()}
                className="px-4 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col (5 cols): Order Management Form & Financials */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Invoice & Kuitansi Documents Card */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF9857]" />
                <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
                  Dokumen & Faktur Resmi
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-warm-ivory px-2 py-0.5 rounded-xs border border-[#D9D7CF] font-bold text-deep-charcoal/70">
                Format Standar A4
              </span>
            </div>

            <p className="text-xs text-deep-charcoal/70 font-sans leading-relaxed">
              Dokumen faktur tagihan (Invoice) dan kuitansi pembayaran resmi siap cetak / unduh PDF, terisi otomatis sesuai template Arvanta Studio.
            </p>

            <div className="text-xs space-y-2 font-mono text-deep-charcoal/80 bg-warm-ivory p-3 rounded-xs border border-[#D9D7CF]">
              <div className="flex justify-between items-center">
                <span className="text-deep-charcoal/60">No. Invoice:</span>
                <span className="font-bold">{generateInvoiceNumber(order.orderNumber, order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-deep-charcoal/60">No. Kuitansi:</span>
                <span className="font-bold">{generateKuitansiNumber(order.orderNumber, order.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <Link
                href={`/admin/orders/${order.id}/document?type=invoice`}
                target="_blank"
                className="px-3 py-2.5 bg-white border border-deep-charcoal/30 hover:border-deep-charcoal hover:bg-warm-ivory/50 text-deep-charcoal font-bold rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Unduh Invoice</span>
              </Link>
              <Link
                href={`/admin/orders/${order.id}/document?type=kuitansi`}
                target="_blank"
                className="px-3 py-2.5 bg-white border border-deep-charcoal/30 hover:border-deep-charcoal hover:bg-warm-ivory/50 text-deep-charcoal font-bold rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                <span>Unduh Kuitansi</span>
              </Link>
            </div>

            <Link
              href={`/admin/orders/${order.id}/document?type=all`}
              target="_blank"
              className="w-full px-3 py-2.5 bg-deep-charcoal hover:bg-muted-olive text-warm-ivory font-bold font-mono text-xs uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#FF9857]" />
              <span>Unduh Keduanya (Lengkap)</span>
            </Link>
          </div>

          <form onSubmit={handleSaveChanges} className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-5 shadow-xs">
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2 flex items-center justify-between">
              <span>Pengaturan & Status Order</span>
              <Save className="w-4 h-4 text-muted-olive" />
            </h3>

            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Status Pesanan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
              >
                <option value="PENDING">PENDING</option>
                <option value="MENUNGGU_KONFIRMASI">MENUNGGU KONFIRMASI</option>
                <option value="MENUNGGU_PEMBAYARAN">MENUNGGU PEMBAYARAN</option>
                <option value="PEMBAYARAN_DIVERIFIKASI">PEMBAYARAN DIVERIFIKASI</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DESIGN_PROCESS">DESIGN PROCESS</option>
                <option value="DEVELOPMENT_PROCESS">DEVELOPMENT PROCESS</option>
                <option value="REVISION">REVISION</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Catatan Perubahan Status (Dikirim ke Klien)
              </label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Contoh: Pembayaran DP diverifikasi, pengerjaan dimulai"
                className="w-full px-3 py-2 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs"
              />
            </div>

            {/* Financial Adjustments */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D9D7CF]">
              <div>
                <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                  Total Biaya (Rp)
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(parseInt(e.target.value || "0", 10))}
                  className="w-full px-3 py-2 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                  Nominal DP (Rp)
                </label>
                <input
                  type="number"
                  value={dpAmount}
                  onChange={(e) => setDpAmount(parseInt(e.target.value || "0", 10))}
                  className="w-full px-3 py-2 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Catatan Internal Studio (Rahasia)
              </label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Catatan pengerjaan desainer internal, jadwal server, catatan teknis..."
                className="w-full p-3 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan Order"}
            </button>
          </form>

          {/* Status Change Timeline History */}
          <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-3 shadow-xs">
            <h3 className="text-xs font-mono uppercase text-deep-charcoal font-bold border-b border-[#D9D7CF] pb-2">
              Riwayat Perubahan Status (Audit Log)
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {order.statusHistory.map((h: any) => (
                <div key={h.id} className="text-xs border-l-2 border-l-muted-olive pl-3 space-y-0.5">
                  <div className="flex justify-between items-center font-mono text-[10px] text-deep-charcoal/60">
                    <span className="font-bold text-deep-charcoal">{h.newStatus}</span>
                    <span>{new Date(h.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {h.notes && <p className="text-deep-charcoal/80 text-[11px]">{h.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
