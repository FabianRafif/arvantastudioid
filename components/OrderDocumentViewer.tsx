"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  FileText,
  Receipt,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  formatIndoDate,
  generateInvoiceNumber,
  generateKuitansiNumber,
  buildInvoiceLineItems,
  terbilang,
} from "@/lib/documents";

interface Props {
  orderIdOrNumber: string;
  backUrl: string;
  role?: "ADMIN" | "CUSTOMER";
}

export default function OrderDocumentViewer({
  orderIdOrNumber,
  backUrl,
  role = "ADMIN",
}: Props) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [docType, setDocType] = useState<"all" | "invoice" | "kuitansi">("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const t = urlParams.get("type");
      if (t === "invoice" || t === "kuitansi" || t === "all") {
        setDocType(t);
      }
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderIdOrNumber}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat data dokumen.");
        setOrder(data.order);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderIdOrNumber]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center font-mono text-xs text-[#2D2D2D]/70">
        Menyiapkan dokumen faktur & kuitansi resmi Arvanta Studio...
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-600" />
        <h2 className="text-lg font-bold text-[#2D2D2D]">Dokumen Tidak Dapat Dimuat</h2>
        <p className="text-xs text-[#2D2D2D]/70 font-mono">{errorMsg || "Pesanan tidak ditemukan."}</p>
        <Link
          href={backUrl}
          className="px-4 py-2 bg-[#2D2D2D] text-white text-xs font-mono uppercase tracking-wider rounded-xs"
        >
          Kembali ke Detail Pesanan
        </Link>
      </div>
    );
  }

  const createdDate = formatIndoDate(order.createdAt);
  const dueDate = formatIndoDate(
    new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  const invoiceNumber = generateInvoiceNumber(order.orderNumber, order.createdAt);
  const kuitansiNumber = generateKuitansiNumber(order.orderNumber, order.createdAt);

  const lineItems = buildInvoiceLineItems(order);
  const totalAmount = order.totalAmount || 0;
  const dpAmount = order.dpAmount || 0;
  const remainingAmount = order.remainingAmount ?? Math.max(0, totalAmount - dpAmount);

  // Status flags
  const isPaidFull =
    order.status === "COMPLETED" ||
    order.status === "PEMBAYARAN_DIVERIFIKASI" ||
    remainingAmount === 0;

  const amountReceived = isPaidFull ? totalAmount : (dpAmount > 0 ? dpAmount : totalAmount);
  const kuitansiTerbilang = terbilang(amountReceived);
  const invoiceTerbilang = terbilang(totalAmount);

  const clientCompany = order.businessName || "-";
  const clientName = order.customerName || "Klien Arvanta Studio";
  const clientPhone = order.customerPhone || "-";

  return (
    <div className="min-h-screen bg-[#E5E3DC] text-[#1A1A1A] font-sans antialiased pb-16 print:bg-white print:p-0 print:m-0">
      {/* Printable Control Toolbar (Hidden on print) */}
      <div className="no-print sticky top-0 z-50 bg-[#20211F] text-white border-b border-black/20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xs text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
            <div>
              <span className="text-[10px] text-white/50 block font-mono uppercase tracking-wider">
                Order #{order.orderNumber}
              </span>
              <span className="text-xs font-bold text-white font-mono truncate max-w-[200px] sm:max-w-xs block">
                {clientName} {clientCompany !== "-" ? `(${clientCompany})` : ""}
              </span>
            </div>
          </div>

          {/* Document Switcher Tabs */}
          <div className="flex items-center bg-black/40 p-1 rounded-xs border border-white/10 text-xs font-mono">
            <button
              onClick={() => setDocType("all")}
              className={`px-3 py-1 rounded-xs transition-colors flex items-center gap-1.5 ${
                docType === "all"
                  ? "bg-[#FF9857] text-[#20211F] font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Semua Dokumen</span>
              <span className="sm:hidden">Semua</span>
            </button>
            <button
              onClick={() => setDocType("invoice")}
              className={`px-3 py-1 rounded-xs transition-colors flex items-center gap-1.5 ${
                docType === "invoice"
                  ? "bg-[#FF9857] text-[#20211F] font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>
            <button
              onClick={() => setDocType("kuitansi")}
              className={`px-3 py-1 rounded-xs transition-colors flex items-center gap-1.5 ${
                docType === "kuitansi"
                  ? "bg-[#FF9857] text-[#20211F] font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Kuitansi</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#FF9857] hover:bg-[#e07f40] text-[#20211F] font-bold text-xs font-mono uppercase tracking-wider rounded-xs flex items-center gap-2 shadow-xs transition-colors active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable Content Container */}
      <div className="max-w-[210mm] mx-auto mt-6 px-4 sm:px-0 space-y-8 print:m-0 print:p-0 print:max-w-none print:space-y-0">
        
        {/* ========================================================= */}
        {/* DOKUMEN 1: INVOICE (FAKTUR TAGIHAN) - Sesuai Template 3 */}
        {/* ========================================================= */}
        {(docType === "all" || docType === "invoice") && (
          <div className="print-page bg-white text-[#1A1A1A] p-8 sm:p-12 border border-[#D9D7CF] shadow-lg print:shadow-none print:border-none print:p-0">
            {/* Header Kop Surat Arvanta Studio */}
            <div className="border-b-2 border-[#1A1A1A] pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#20211F] rounded-xs flex items-center justify-center text-[#FF9857] font-mono font-black text-xl shrink-0">
                    //
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-[#1A1A1A] uppercase leading-tight">
                      ARVANTA STUDIO
                    </h1>
                    <p className="text-[11px] text-[#4A4A4A] font-sans">
                      Purwokerto, Jawa Tengah, Indonesia | Email: rafifazmi466@gmail.com | WA: 0895-3224-65836
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-[#20211F] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-xs">
                    FAKTUR RESMI
                  </span>
                </div>
              </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center my-4">
              <h2 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider text-[#1A1A1A]">
                INVOICE (FAKTUR TAGIHAN)
              </h2>
            </div>

            {/* Grid Informasi Tagihan 4 Kuadran (Sesuai Template 3) */}
            <div className="border border-[#1A1A1A] text-xs font-sans mb-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1A1A1A]">
                {/* Kolom Kiri: Metadata Invoice */}
                <div className="divide-y divide-[#1A1A1A]">
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Nomor Invoice</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6 font-mono font-bold">{invoiceNumber}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Tanggal Terbit</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6">{createdDate.shortDate}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Jatuh Tempo</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6">{dueDate.shortDate}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Status Tagihan</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6 font-bold text-[#1A1A1A]">
                      {isPaidFull ? "Pelunasan / Tagihan Penuh (LUNAS)" : "Tagihan Pembayaran Uang Muka (DP 50%)"}
                    </span>
                  </div>
                </div>

                {/* Kolom Kanan: Identitas Klien */}
                <div className="divide-y divide-[#1A1A1A]">
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Ditagihkan Kepada</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6 font-bold">{clientName}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Instansi / Proyek</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6">{clientCompany}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Kontak / Telepon</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6 font-mono">{clientPhone}</span>
                  </div>
                  <div className="grid grid-cols-12 py-2 px-3">
                    <span className="col-span-5 font-bold">Alamat</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-6">Indonesia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paragraf Pembuka */}
            <p className="text-xs text-[#2D2D2D] leading-relaxed mb-4">
              Berikut ini adalah rincian tagihan biaya atas layanan pengembangan sistem, desain antarmuka, dan/atau
              infrastruktur digital yang dikerjakan oleh Arvanta Studio sesuai dengan kesepakatan proyek:
            </p>

            {/* Tabel Rincian Biaya (Sesuai Template 3) */}
            <table className="w-full text-xs border border-[#1A1A1A] border-collapse mb-4">
              <thead>
                <tr className="bg-[#F4F1EA] border-b border-[#1A1A1A] font-bold text-center">
                  <th className="py-2.5 px-3 border-r border-[#1A1A1A] w-12">No</th>
                  <th className="py-2.5 px-4 border-r border-[#1A1A1A] text-left">
                    Deskripsi Layanan / Komponen Pekerjaan
                  </th>
                  <th className="py-2.5 px-3 border-r border-[#1A1A1A] w-24">Qty</th>
                  <th className="py-2.5 px-4 border-r border-[#1A1A1A] text-right w-36">Harga Satuan (Rp)</th>
                  <th className="py-2.5 px-4 text-right w-36">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {lineItems.map((item) => (
                  <tr key={item.no} className="hover:bg-warm-ivory/20">
                    <td className="py-2 px-3 text-center border-r border-[#1A1A1A] font-mono">{item.no}.</td>
                    <td className="py-2 px-4 border-r border-[#1A1A1A] leading-relaxed">{item.description}</td>
                    <td className="py-2 px-3 text-center border-r border-[#1A1A1A] font-mono">{item.qty}</td>
                    <td className="py-2 px-4 text-right border-r border-[#1A1A1A] font-mono">
                      Rp {item.unitPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-semibold">
                      Rp {item.totalPrice.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-[#1A1A1A] divide-y divide-[#1A1A1A] font-mono text-xs">
                <tr>
                  <td colSpan={4} className="py-2 px-4 text-right font-bold border-r border-[#1A1A1A]">
                    Subtotal Biaya
                  </td>
                  <td className="py-2 px-4 text-right font-bold">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-2 px-4 text-right border-r border-[#1A1A1A]">
                    Potongan / Diskon
                  </td>
                  <td className="py-2 px-4 text-right">
                    Rp 0
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-2 px-4 text-right border-r border-[#1A1A1A]">
                    Uang Muka (DP) / Pembayaran Sebelumnya
                  </td>
                  <td className="py-2 px-4 text-right">
                    Rp {dpAmount.toLocaleString("id-ID")}
                  </td>
                </tr>
                <tr className="bg-[#F4F1EA] font-bold text-sm">
                  <td colSpan={4} className="py-2.5 px-4 text-right border-r border-[#1A1A1A]">
                    Total Pembayaran
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#1A1A1A]">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Terbilang */}
            <div className="p-3 bg-[#F4F1EA] border border-[#1A1A1A] text-xs font-mono mb-6">
              <span className="font-bold">Terbilang: </span>
              <span className="italic font-bold"># {invoiceTerbilang} #</span>
            </div>

            {/* Informasi & Ketentuan Pembayaran (Sesuai Template 3) */}
            <div className="border border-[#1A1A1A] p-4 text-[11px] leading-relaxed mb-6 space-y-2 bg-white">
              <p className="font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#1A1A1A]/30 pb-1">
                Informasi & Ketentuan Pembayaran:
              </p>
              <div className="space-y-1">
                <p>Pembayaran tagihan dapat dilakukan melalui transfer ke:</p>
                <p className="font-bold font-mono text-xs">
                  E-Wallet GoPay: 0821-2398-9398 (a.n. Fabian Rafif Azmi)
                </p>
                <p className="font-semibold pt-1">Transfer dari Bank Umum ke GoPay (Virtual Account):</p>
                <ul className="list-disc pl-5 font-mono space-y-0.5">
                  <li>BCA: 70001 + 082123989398</li>
                  <li>Mandiri: 60737 + 082123989398</li>
                  <li>BRI: 301341 + 082123989398</li>
                  <li>Bank Lain / Bersama: Pilih Bank Permata, masukkan kode 898 + 082123989398</li>
                </ul>
                <p className="italic text-[10px] text-[#4A4A4A] pt-1">
                  * Check Kembali A.N. dan Jika lewat Virtual Account pastikan ( Gopay ) Tampilannya sebelum Melakukan Transaksi.
                </p>
                <p className="pt-1">
                  Pembayaran juga dapat dilakukan secara Tunai (Cash) pada saat serah terima sistem dan penandatanganan berita acara di lokasi.
                </p>
                <p className="pt-1">
                  Mohon mengirimkan bukti transfer pembayaran melalui kontak resmi Arvanta Studio (WhatsApp: 0895-3224-65836 atau Email: rafifazmi466@gmail.com) agar pembayaran dapat segera diverifikasi dan diterbitkan Kuitansi resmi.
                </p>
              </div>
            </div>

            {/* Kalimat Penutup */}
            <p className="text-xs text-[#2D2D2D] leading-relaxed mb-8">
              Demikian faktur tagihan (invoice) ini diterbitkan dengan sebenarnya sebagai dasar pembayaran yang sah atas layanan yang telah disepakati bersama.
            </p>

            {/* Kolom Tanda Tangan (Sesuai Template 3) */}
            <div className="grid grid-cols-2 gap-8 text-xs font-sans pt-2">
              <div className="text-center">
                <p className="font-semibold mb-1">Diterima Oleh,</p>
                <p className="text-xs text-[#4A4A4A] mb-16">
                  Klien, {clientCompany !== "-" ? clientCompany : "Pemesan"}
                </p>
                <div className="w-48 mx-auto border-b border-[#1A1A1A] pb-1">
                  <span className="font-bold underline block">{clientName}</span>
                </div>
                <p className="text-[11px] text-[#4A4A4A] mt-1">
                  {clientCompany !== "-" ? "Penanggung Jawab Proyek" : "Klien Pemesan"}
                </p>
              </div>

              <div className="text-center">
                <p className="font-semibold mb-1">Purwokerto, {createdDate.fullDate}</p>
                <p className="text-xs text-[#4A4A4A] mb-16">Hormat Kami, Arvanta Studio</p>
                <div className="w-48 mx-auto border-b border-[#1A1A1A] pb-1">
                  <span className="font-bold underline block">Fabian Rafif Azmi</span>
                </div>
                <p className="text-[11px] text-[#4A4A4A] mt-1">Lead Developer Arvanta Studio</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Break for printing both documents */}
        {docType === "all" && <div className="page-break" />}

        {/* ========================================================= */}
        {/* DOKUMEN 2: KUITANSI RESMI - Sesuai Template 2 */}
        {/* ========================================================= */}
        {(docType === "all" || docType === "kuitansi") && (
          <div className="print-page bg-white text-[#1A1A1A] p-8 sm:p-12 border border-[#D9D7CF] shadow-lg print:shadow-none print:border-none print:p-0">
            {/* Header Kop Surat Arvanta Studio */}
            <div className="border-b-2 border-[#1A1A1A] pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#20211F] rounded-xs flex items-center justify-center text-[#FF9857] font-mono font-black text-xl shrink-0">
                    //
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-[#1A1A1A] uppercase leading-tight">
                      ARVANTA STUDIO
                    </h1>
                    <p className="text-[11px] text-[#4A4A4A] font-sans">
                      Purwokerto, Jawa Tengah, Indonesia | Email: rafifazmi466@gmail.com | WA: 0895-3224-65836
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-800 text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-xs">
                    BUKTI SAH
                  </span>
                </div>
              </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center my-4 space-y-1">
              <h2 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider text-[#1A1A1A]">
                KUITANSI (BUKTI PENERIMAAN PEMBAYARAN)
              </h2>
              <p className="text-xs font-mono font-bold text-[#1A1A1A]">
                Nomor Kuitansi: {kuitansiNumber}
              </p>
            </div>

            {/* Pernyataan Pembuka Kuitansi */}
            <p className="text-xs text-[#2D2D2D] leading-relaxed my-4 text-justify">
              {createdDate.formalStatement}
            </p>

            {/* Tabel Isi Kuitansi (Sesuai Format Template 2) */}
            <div className="border border-[#1A1A1A] text-xs font-sans mb-6 divide-y divide-[#1A1A1A]">
              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Telah Terima Dari</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8 font-bold text-sm">{clientName}</span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Instansi / Perusahaan</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8">{clientCompany}</span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3 bg-[#F4F1EA]">
                <span className="col-span-4 sm:col-span-3 font-bold">Uang Sejumlah (Terbilang)</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8 font-mono font-bold italic text-xs">
                  # {kuitansiTerbilang} #
                </span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Untuk Pembayaran</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8 leading-relaxed">
                  {order.serviceType === "WEBSITE"
                    ? `Pelunasan biaya Jasa Pengembangan Sistem & Pembuatan Website Custom (${order.websiteType || "Website Custom"}), Desain Antarmuka (UI/UX Responsive), Infrastruktur Pihak Ketiga (Registrasi Nama Domain & Server Cloud), serta Konfigurasi Server & Jaminan Garansi Sistem.`
                    : `Pelunasan biaya Jasa Pembuatan Desain Grafis & Identitas Branding (${order.designConcept || "Desain Grafis"}), Penyiapan Berkas Master Resolusi Tinggi (Export File AI, PDF, PNG, SVG), serta Penyerahan Hak Cipta Desain.`}
                </span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Referensi Nomor Invoice</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8 font-mono font-bold">{invoiceNumber}</span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Metode Pembayaran</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8">
                  Transfer E-Wallet GoPay (082123989398 a.n. Fabian Rafif Azmi) / Transfer Bank
                </span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Status Pembayaran</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8 font-bold text-emerald-800">
                  {isPaidFull ? "Pelunasan Penuh (LUNAS)" : "Pembayaran Uang Muka (DP 50%)"}
                </span>
              </div>

              <div className="grid grid-cols-12 py-2.5 px-3">
                <span className="col-span-4 sm:col-span-3 font-bold">Sisa Tagihan (Jika Ada)</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8">
                  {isPaidFull
                    ? "Rp 0,- (Lunas — Tagihan telah terselesaikan secara penuh)"
                    : `Rp ${remainingAmount.toLocaleString("id-ID")},- (Sisa pelunasan saat serah terima sistem)`}
                </span>
              </div>

              {/* Total Diterima Highlight Row */}
              <div className="grid grid-cols-12 py-3 px-3 bg-[#20211F] text-white font-mono">
                <span className="col-span-4 sm:col-span-3 font-bold uppercase tracking-wider text-xs">
                  JUMLAH DITERIMA (RP)
                </span>
                <span className="col-span-1 text-center font-bold">:</span>
                <span className="col-span-7 sm:col-span-8 font-bold text-base text-[#FF9857]">
                  Rp {amountReceived.toLocaleString("id-ID")},-
                </span>
              </div>
            </div>

            {/* Catatan & Ketentuan Bukti Pembayaran (Sesuai Template 2) */}
            <div className="border border-[#1A1A1A] p-4 text-[11px] leading-relaxed mb-6 space-y-1.5 bg-[#F4F1EA]">
              <p className="font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#1A1A1A]/30 pb-1">
                Catatan & Ketentuan Bukti Pembayaran:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-[#2D2D2D]">
                <li>
                  Kuitansi ini merupakan bukti penerimaan pembayaran yang sah dari Arvanta Studio setelah dana pembayaran
                  terkonfirmasi masuk secara penuh ke rekening resmi atau diterima secara tunai.
                </li>
                <li>
                  Harap menyimpan dokumen kuitansi ini dengan baik sebagai bukti administrasi yang sah untuk keperluan serah
                  terima proyek (BAST) maupun klaim layanan jaminan sistem.
                </li>
              </ol>
            </div>

            {/* Kalimat Penutup */}
            <p className="text-xs text-[#2D2D2D] leading-relaxed mb-8">
              Demikian kuitansi bukti pembayaran ini diterbitkan dengan sebenarnya untuk dapat dipergunakan sebagaimana
              mestinya oleh kedua belah pihak.
            </p>

            {/* Kolom Tanda Tangan (Sesuai Template 2) */}
            <div className="grid grid-cols-2 gap-8 text-xs font-sans pt-2">
              <div className="text-center">
                <p className="font-semibold mb-1">Penyetor / Pembayar,</p>
                <p className="text-xs text-[#4A4A4A] mb-16">
                  {clientCompany !== "-" ? clientCompany : "Klien Pemesan"}
                </p>
                <div className="w-48 mx-auto border-b border-[#1A1A1A] pb-1">
                  <span className="font-bold underline block">{clientName}</span>
                </div>
                <p className="text-[11px] text-[#4A4A4A] mt-1">
                  {clientCompany !== "-" ? "Penanggung Jawab Proyek" : "Klien / Pemesan"}
                </p>
              </div>

              <div className="text-center">
                <p className="font-semibold mb-1">Penerima Pembayaran,</p>
                <p className="text-xs text-[#4A4A4A] mb-16">Arvanta Studio</p>
                <div className="w-48 mx-auto border-b border-[#1A1A1A] pb-1">
                  <span className="font-bold underline block">Fabian Rafif Azmi</span>
                </div>
                <p className="text-[11px] text-[#4A4A4A] mt-1">Lead Developer Arvanta Studio</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
