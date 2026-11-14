"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLiveSync } from "@/lib/useLiveSync";
import {
  Code2,
  Palette,
  Upload,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { broadcastLiveUpdate } from "@/lib/live-sync";

interface ServiceItem {
  id: string;
  name: string;
  priceFrom: number;
  packages: { id: string; name: string; price: number; deliveryDays: number }[];
}

interface DesignItem {
  id: string;
  name: string;
  priceStarting: number;
  category: { name: string };
}

function OrderFormContent() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") || searchParams.get("type");
  const catalogParam = searchParams.get("catalog") || searchParams.get("designId") || searchParams.get("item");

  const [serviceType, setServiceType] = useState<"WEBSITE" | "GRAPHIC_DESIGN">(
    serviceParam &&
      (serviceParam.toUpperCase() === "GRAPHIC_DESIGN" ||
        serviceParam.toUpperCase() === "DESIGN" ||
        serviceParam.toUpperCase() === "DESAIN")
      ? "GRAPHIC_DESIGN"
      : "WEBSITE"
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Dynamic catalog options
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [designItems, setDesignItems] = useState<DesignItem[]>([]);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState("");
  const [preferredBudget, setPreferredBudget] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Website specific
  const [businessName, setBusinessName] = useState("");
  const [websiteType, setWebsiteType] = useState("Company Profile");
  const [websiteGoal, setWebsiteGoal] = useState("");
  const [featuresNeeded, setFeaturesNeeded] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");

  // Design specific
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [designSize, setDesignSize] = useState("Instagram Feed (1080x1080)");
  const [designQuantity, setDesignQuantity] = useState(1);
  const [designConcept, setDesignConcept] = useState("");
  const [selectedColors, setSelectedColors] = useState("");
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    if (serviceParam) {
      const upper = serviceParam.toUpperCase();
      if (upper === "GRAPHIC_DESIGN" || upper === "DESIGN" || upper === "DESAIN") {
        setServiceType("GRAPHIC_DESIGN");
      } else if (upper === "WEBSITE" || upper === "WEB") {
        setServiceType("WEBSITE");
      }
    }
  }, [serviceParam]);

  useEffect(() => {
    // Fetch catalogs from API
    fetch("/api/admin/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services) {
          setServices(data.services);
          if (data.services[0]?.packages?.[0]) {
            setSelectedPackageId(data.services[0].packages[0].id);
          }
        }
      });

    fetch("/api/admin/design")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) {
          setDesignItems(data.items);
          if (catalogParam) {
            const matched = data.items.find(
              (it: any) =>
                it.id === catalogParam ||
                it.slug === catalogParam ||
                it.name?.toLowerCase().includes(catalogParam.toLowerCase())
            );
            if (matched) {
              setSelectedDesignId(matched.id);
              setServiceType("GRAPHIC_DESIGN");
              return;
            }
          }
          if (data.items[0]) {
            setSelectedDesignId(data.items[0].id);
          }
        }
      });
  }, [catalogParam]);

  const liveSync = useLiveSync();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedLabel, setAppliedLabel] = useState<string>("");
  const [copiedPromo, setCopiedPromo] = useState(false);

  const activeVoucher = liveSync.promotions.flashSale.isActive
    ? liveSync.promotions.flashSale.voucherCode
    : (liveSync.promotions.coupons[0]?.code || "");

  const copyPromo = async () => {
    if (!activeVoucher) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(activeVoucher);
      } else {
        const el = document.createElement("textarea");
        el.value = activeVoucher;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2500);
    } catch {
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2500);
    }
  };

  const validateAndApplyVoucher = async (code: string, currentSubtotal: number) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setAppliedPromo(null);
      setAppliedDiscount(0);
      setAppliedLabel("");
      return;
    }

    if (
      liveSync.promotions.flashSale.isActive &&
      clean === liveSync.promotions.flashSale.voucherCode.toUpperCase()
    ) {
      const pct = liveSync.promotions.flashSale.discountPercent || 20;
      const disc = Math.round(currentSubtotal * (pct / 100));
      setAppliedPromo(clean);
      setAppliedDiscount(disc);
      setAppliedLabel(`Promo Flash Sale -${pct}%`);
      setErrorMsg("");
      return;
    }

    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean, amount: currentSubtotal }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setAppliedPromo(clean);
        setAppliedDiscount(data.coupon.discountAmount || 0);
        setAppliedLabel(
          data.coupon.discountType === "PERCENTAGE"
            ? `Diskon ${data.coupon.discountValue}%`
            : `Potongan Rp${Number(data.coupon.discountValue).toLocaleString("id-ID")}`
        );
        setErrorMsg("");
      } else {
        setAppliedPromo(null);
        setAppliedDiscount(0);
        setAppliedLabel("");
        setErrorMsg(data.error || "Kode kupon tidak valid atau sudah kadaluarsa.");
      }
    } catch {
      setErrorMsg("Gagal memvalidasi kupon. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qPromo = params.get("promo") || params.get("coupon");
      if (qPromo) {
        setPromoCode(qPromo.toUpperCase());
        validateAndApplyVoucher(qPromo.toUpperCase(), calculateSubtotal());
      }
    }
  }, []);

  // Compute estimate with live package prices
  const availablePackages =
    services.flatMap((s) => s.packages || []).length > 0
      ? services.flatMap((s) => s.packages || [])
      : liveSync.pricing.packages;

  useEffect(() => {
    if (!selectedPackageId && availablePackages.length > 0) {
      setSelectedPackageId(availablePackages[0].id);
    }
  }, [availablePackages, selectedPackageId]);

  const calculateSubtotal = () => {
    if (serviceType === "WEBSITE") {
      const livePkg = availablePackages.find((p) => p.id === selectedPackageId);
      if (livePkg) return livePkg.price;
      return liveSync.pricing.lowestWebsitePrice || 1500000;
    } else {
      const foundDesign = designItems.find((d) => d.id === selectedDesignId);
      const base = foundDesign ? foundDesign.priceStarting : 50000;
      return base * (designQuantity || 1);
    }
  };

  const subtotal = calculateSubtotal();
  const discountAmount = appliedDiscount;
  const totalEstimate = Math.max(0, subtotal - discountAmount);
  const dpEstimate = Math.round(totalEstimate * 0.5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const list = Array.from(e.target.files);
      setFiles(list);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Nama Lengkap dan Nomor WhatsApp wajib diisi sebelum mengirim pesanan.");
      const errElem = document.getElementById("order-form-error-bottom");
      if (errElem) errElem.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      const cleanNotes = notes.trim() || "-";

      fd.append("serviceType", serviceType);
      fd.append("customerName", customerName.trim());
      fd.append("customerPhone", customerPhone.trim());
      fd.append("customerEmail", customerEmail.trim());
      fd.append("notes", cleanNotes);
      fd.append("deadline", deadline);
      fd.append("preferredBudget", `Rp${totalEstimate.toLocaleString("id-ID")}`);
      fd.append("promoCode", appliedPromo || "");

      if (serviceType === "WEBSITE") {
        fd.append("businessName", businessName);
        fd.append("websiteType", websiteType);
        fd.append("websiteGoal", websiteGoal);
        fd.append("featuresNeeded", featuresNeeded);
        fd.append("servicePackageId", selectedPackageId || availablePackages[0]?.id || "");
        fd.append("referenceUrl", referenceUrl);
      } else {
        fd.append("designCatalogId", selectedDesignId || designItems[0]?.id || "");
        fd.append("designSize", designSize);
        fd.append("designQuantity", String(designQuantity));
        fd.append("designConcept", designConcept);
        fd.append("selectedColors", selectedColors);
        fd.append("textContent", textContent);
      }

      for (const file of files) {
        fd.append("files", file);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pesanan.");
      }

      setOrderSuccess(data);

      // Trigger instant real-time live sync to all Admin tabs in 0ms!
      broadcastLiveUpdate();

      // Automatically open WhatsApp to Admin with prefilled order
      const targetWaUrl = data.whatsappUrl || data.manualWhatsAppUrl;
      if (targetWaUrl) {
        try {
          const opened = window.open(targetWaUrl, "_blank");
          if (!opened || opened.closed || typeof opened.closed === "undefined") {
            // Popup blocker might have blocked it, redirect tab directly
            window.location.href = targetWaUrl;
          }
        } catch {
          window.location.href = targetWaUrl;
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      {/* Crafto Editorial Hero Header */}
      <section className="pt-36 pb-16 md:pt-48 md:pb-24 border-b border-[#D8D8D4] relative overflow-hidden">
        {/* Subtle architectural vertical grid guidelines */}
        <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-4 opacity-30">
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="h-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D8D8D4] text-[#2D2D2D] text-xs font-semibold font-space uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9857] animate-pulse" />
            <span>Formulir Pemesanan Resmi</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            START YOUR DIGITAL PROJECT.
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl mx-auto leading-relaxed font-sans">
            Pilih jenis layanan, isi kebutuhan teknis atau konsep visual Anda, dan sistem akan langsung meneruskannya ke dashboard serta WhatsApp admin Arvanta Studio.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {orderSuccess ? (
            /* Success State */
            <div className="bg-white border-2 border-emerald-600 p-8 sm:p-12 rounded-2xl shadow-xl space-y-6 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-full mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#FF9857] font-semibold font-space">
                  Pesanan Berhasil Diterima & Terhubung ke WA!
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] font-bebas">
                  Nomor Order: {orderSuccess.orderNumber || orderSuccess.order?.orderNumber}
                </h2>
                <p className="text-xs sm:text-sm text-[#787875] max-w-md mx-auto">
                  Detail kebutuhan dan brief proyek Anda telah tersimpan secara aman di database dan diteruskan langsung ke WhatsApp Admin Arvanta Studio.
                </p>
              </div>

              <div className="p-5 bg-[#EDECE8] border border-[#D8D8D4] rounded-xl text-xs font-space text-[#2D2D2D] space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span>Estimasi Total:</span>
                  <span className="font-bold">
                    Rp{(orderSuccess.totalAmount || orderSuccess.order?.totalAmount)?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Down Payment (50%):</span>
                  <span className="font-bold text-[#FF9857]">
                    Rp{(orderSuccess.dpAmount || orderSuccess.order?.dpAmount)?.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                {(orderSuccess.whatsappUrl || orderSuccess.manualWhatsAppUrl) && (
                  <a
                    href={orderSuccess.whatsappUrl || orderSuccess.manualWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#1ebd5b] text-white text-xs font-bold uppercase tracking-wider font-space rounded-full shadow-lg transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Lanjutkan ke WhatsApp Admin ↗</span>
                  </a>
                )}
                <a
                  href={`/dashboard/orders/${orderSuccess.orderNumber || orderSuccess.order?.orderNumber}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full shadow-md transition-all"
                >
                  <span>Buka Tracking Order</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            /* Order Form */
            <div className="bg-white/80 border border-[#D8D8D4] rounded-2xl overflow-hidden shadow-xs">
              {/* Service Tab Switcher */}
              <div className="grid grid-cols-2 border-b border-[#D8D8D4] bg-[#EDECE8] text-center">
                <button
                  type="button"
                  onClick={() => setServiceType("WEBSITE")}
                  className={`py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider font-space flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    serviceType === "WEBSITE"
                      ? "bg-white text-[#2D2D2D] border-b-2 border-b-[#FF9857] font-bold"
                      : "text-[#787875] hover:text-[#2D2D2D]"
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Jasa Pembuatan Website</span>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType("GRAPHIC_DESIGN")}
                  className={`py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider font-space flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    serviceType === "GRAPHIC_DESIGN"
                      ? "bg-white text-[#2D2D2D] border-b-2 border-b-[#FF9857] font-bold"
                      : "text-[#787875] hover:text-[#2D2D2D]"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Jasa Graphic Design</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-4 mx-8 mt-6 bg-red-50 border border-red-200 text-xs text-red-800 rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
                {/* Section A: Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted-olive font-bold border-b border-[#D9D7CF]/60 pb-2">
                    01. Informasi Kontak Pemesan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Dimas Pratama"
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Nomor WhatsApp Aktif *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Alamat Email (Opsional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="klien@gmail.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Service-Specific Requirements */}
                {serviceType === "WEBSITE" ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-muted-olive font-bold border-b border-[#D9D7CF]/60 pb-2">
                      02. Spesifikasi Kebutuhan Website
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Nama Bisnis / Brand / Instansi
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Contoh: PT Surya Nusantara"
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Kategori Website
                        </label>
                        <select
                          value={websiteType}
                          onChange={(e) => setWebsiteType(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        >
                          <option>Company Profile</option>
                          <option>Business Website</option>
                          <option>Personal Portfolio</option>
                          <option>Online Store / E-Commerce</option>
                          <option>Landing Page</option>
                          <option>School Website</option>
                          <option>Organization Website</option>
                          <option>Travel Website</option>
                          <option>Restaurant Website</option>
                          <option>Booking Website</option>
                          <option>Custom Website</option>
                        </select>
                      </div>
                    </div>

                    {/* Website Package Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1.5">
                        Pilih Paket Layanan Website
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availablePackages.map((pkg) => (
                          <label
                            key={pkg.id}
                            className={`p-3.5 border rounded-xs cursor-pointer flex items-center justify-between text-xs transition-colors ${
                              selectedPackageId === pkg.id
                                ? "border-deep-charcoal bg-warm-ivory"
                                : "border-[#D9D7CF] bg-white hover:border-deep-charcoal/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="pkg"
                                checked={selectedPackageId === pkg.id}
                                onChange={() => setSelectedPackageId(pkg.id)}
                                className="text-deep-charcoal"
                              />
                              <div>
                                <span className="font-bold text-deep-charcoal block">
                                  {pkg.name}
                                </span>
                                <span className="text-[10px] text-deep-charcoal/60">
                                  Waktu: ~{pkg.deliveryDays} hari kerja
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-deep-charcoal">
                              Rp{pkg.price.toLocaleString("id-ID")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-xs">
                      <strong>Informasi Domain & Hosting:</strong> Biaya website di atas belum termasuk biaya domain (.com/.id) dan cloud hosting. Estimasi biaya hosting & domain adalah Rp500.000 – Rp700.000 / tahun, disiapkan terpisah sesuai spesifikasi.
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Tujuan Utama Website
                      </label>
                      <input
                        type="text"
                        value={websiteGoal}
                        onChange={(e) => setWebsiteGoal(e.target.value)}
                        placeholder="Contoh: Meningkatkan kredibilitas & mendapatkan calon klien via WhatsApp"
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Fitur Tambahan yang Diinginkan
                      </label>
                      <textarea
                        rows={2}
                        value={featuresNeeded}
                        onChange={(e) => setFeaturesNeeded(e.target.value)}
                        placeholder="Contoh: Integrasi Google Maps, formulir pendaftaran, multi-bahasa, katalog produk..."
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        URL Referensi Website Disukai (Opsional)
                      </label>
                      <input
                        type="url"
                        value={referenceUrl}
                        onChange={(e) => setReferenceUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>
                  </div>
                ) : (
                  /* Graphic Design Requirements */
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-muted-olive font-bold border-b border-[#D9D7CF]/60 pb-2">
                      02. Spesifikasi Kebutuhan Desain Grafis
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Produk / Kategori Desain
                        </label>
                        <select
                          value={selectedDesignId}
                          onChange={(e) => setSelectedDesignId(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        >
                          {designItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} — Rp{item.priceStarting.toLocaleString("id-ID")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Ukuran / Format Dimensi
                        </label>
                        <select
                          value={designSize}
                          onChange={(e) => setDesignSize(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        >
                          <option>Instagram Feed (1080x1080)</option>
                          <option>Instagram Story (1080x1920)</option>
                          <option>A4 (21 x 29.7 cm)</option>
                          <option>A5 (14.8 x 21 cm)</option>
                          <option>X-Banner (60 x 160 cm)</option>
                          <option>Roll Up Banner (80 x 200 cm)</option>
                          <option>Kartu Nama (9 x 5.5 cm)</option>
                          <option>Custom Dimension</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Jumlah Desain
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={designQuantity}
                          onChange={(e) => setDesignQuantity(parseInt(e.target.value || "1", 10))}
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Konsep Desain & Nuansa Visual
                      </label>
                      <textarea
                        rows={2}
                        value={designConcept}
                        onChange={(e) => setDesignConcept(e.target.value)}
                        placeholder="Contoh: Gaya editorial minimalis, elegan, target pelanggan usia muda 20-35 tahun..."
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Preferensi Warna
                        </label>
                        <input
                          type="text"
                          value={selectedColors}
                          onChange={(e) => setSelectedColors(e.target.value)}
                          placeholder="Contoh: Warm ivory, olive green, charcoal"
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                          Teks / Konten yang Wajib Dicantumkan
                        </label>
                        <input
                          type="text"
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          placeholder="Judul promo, kontak, tagline..."
                          className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section C: Upload Reference & Notes */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted-olive font-bold border-b border-[#D9D7CF]/60 pb-2">
                    03. Unggah Referensi & Catatan Tambahan
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                      Unggah File Referensi / Sketsa / Logo (JPG, PNG, WEBP, PDF)
                    </label>
                    <div className="border-2 border-dashed border-[#D9D7CF] hover:border-deep-charcoal p-6 text-center rounded-xs bg-warm-ivory transition-colors">
                      <Upload className="w-6 h-6 text-deep-charcoal/50 mx-auto mb-2" />
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="text-xs text-deep-charcoal file:mr-4 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-deep-charcoal file:text-warm-ivory hover:file:bg-muted-olive cursor-pointer"
                      />
                      <p className="text-[11px] text-deep-charcoal/60 mt-2 font-mono">
                        Maksimal 15MB per file. Foto yang Anda unggah akan dikirimkan langsung ke WhatsApp & dashboard admin.
                      </p>
                      {files.length > 0 && (
                        <div className="mt-3 text-xs font-mono text-emerald-800">
                          {files.length} file dipilih: {files.map((f) => f.name).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Ekspektasi Deadline (Opsional)
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                        Catatan Khusus Tambahan
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Butuh penawaran resmi / invoice atas nama kantor"
                        className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: Order Summary & Submit */}
                <div className="pt-6 border-t border-[#D9D7CF] space-y-4">
                  {/* Voucher Input */}
                  <div className="p-4 bg-white border border-[#D9D7CF] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-muted-olive text-warm-ivory font-bold font-mono text-[10px] rounded-xs uppercase">
                        Kupon Promo
                      </span>
                      <span className="font-semibold text-deep-charcoal">
                        Punya Kode Kupon Diskon?
                      </span>
                      {activeVoucher && (
                        <button
                          type="button"
                          onClick={copyPromo}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-olive hover:underline ml-1 select-none"
                          title={`Salin kode kupon ${activeVoucher}`}
                        >
                          {copiedPromo ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                              <Check className="w-3 h-3" />
                              <span>Tersalin!</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5">
                              <Copy className="w-3 h-3" />
                              <span>Salin: {activeVoucher}</span>
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder={activeVoucher ? `Contoh: ${activeVoucher}` : "KODE KUPON"}
                        className="px-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold text-xs uppercase w-full sm:w-36 focus:outline-hidden focus:border-deep-charcoal"
                      />
                      <button
                        type="button"
                        onClick={() => validateAndApplyVoucher(promoCode, subtotal)}
                        className="px-3 py-1.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors shrink-0"
                      >
                        Gunakan
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-warm-ivory border border-[#D9D7CF] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider font-mono text-muted-olive font-bold block">
                        Ringkasan Estimasi Biaya
                      </span>

                      {appliedPromo && (
                        <div className="flex items-center gap-2 text-xs font-mono text-deep-charcoal/70">
                          <span>Subtotal: Rp{subtotal.toLocaleString("id-ID")}</span>
                          <span className="text-emerald-700 font-bold">
                            ({appliedLabel || `Kupon ${appliedPromo}`}: -Rp{discountAmount.toLocaleString("id-ID")})
                          </span>
                        </div>
                      )}

                      <div className="text-2xl font-display font-bold text-deep-charcoal">
                        Rp{totalEstimate.toLocaleString("id-ID")}
                      </div>
                      <span className="text-[11px] text-deep-charcoal/60 font-mono block">
                        DP 50%: Rp{dpEstimate.toLocaleString("id-ID")} (dibayarkan setelah verifikasi brief)
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-9 py-4 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FF9857]" />
                          <span>Menghubungkan ke WA &amp; Admin...</span>
                        </>
                      ) : (
                        <span>Kirim Pesanan Sekarang ↗</span>
                      )}
                    </button>
                  </div>

                  {errorMsg && (
                    <div
                      id="order-form-error-bottom"
                      className="p-4 bg-red-50 border border-red-300 text-xs text-red-800 rounded-xl flex items-center gap-2 shadow-xs"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span className="font-semibold">{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-deep-charcoal/60 justify-center font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Data Anda terlindungi & pesanan langsung terhubung ke WhatsApp Admin Arvanta.</span>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#EDECE8] text-[#2D2D2D] font-space text-xs">
          Memuat formulir pemesanan...
        </div>
      }
    >
      <OrderFormContent />
    </Suspense>
  );
}
