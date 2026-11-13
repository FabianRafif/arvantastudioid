"use client";

import { useState, useEffect, useRef } from "react";
import { broadcastLiveUpdate } from "@/lib/live-sync";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Upload,
  Eye,
  RefreshCw,
  Tag,
  Sliders,
  Calendar,
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string;
  targetUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Flash Sale Settings state
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const [flashSaleTitle, setFlashSaleTitle] = useState("PROMO SPESIAL — ARVANTA STUDIO");
  const [flashSaleSubtitle, setFlashSaleSubtitle] = useState("Diskon Spesial Pembuatan Website & Desain Grafis Khusus Hari Ini!");
  const [flashSaleDiscount, setFlashSaleDiscount] = useState("20");
  const [flashSaleVoucher, setFlashSaleVoucher] = useState("PROMO20");
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // New Banner Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("PROMO SPESIAL");
  const [targetUrl, setTargetUrl] = useState("/order");
  const [sortOrder, setSortOrder] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resBanners, resPublic] = await Promise.all([
        fetch("/api/admin/banners"),
        fetch("/api/banners"),
      ]);

      let loadedBanners: Banner[] = [];
      if (resBanners.ok) {
        const data = await resBanners.json();
        if (Array.isArray(data.banners) && data.banners.length > 0) {
          loadedBanners = data.banners;
        }
      }

      if (resPublic.ok) {
        const pubData = await resPublic.json();
        if (loadedBanners.length === 0 && Array.isArray(pubData.banners) && pubData.banners.length > 0) {
          loadedBanners = pubData.banners;
        }

        if (pubData.flashSale) {
          setFlashSaleActive(pubData.flashSale.isActive);
          setFlashSaleTitle(pubData.flashSale.title);
          setFlashSaleSubtitle(pubData.flashSale.subtitle);
          setFlashSaleDiscount(pubData.flashSale.discountPercent);
          setFlashSaleVoucher(pubData.flashSale.voucherCode);
          if (pubData.flashSale.endTime) {
            setFlashSaleEndTime(new Date(pubData.flashSale.endTime).toISOString().slice(0, 16));
          }
        }
      }

      setBanners(loadedBanners);
    } catch {
      setErrorMsg("Gagal memuat data banner dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Client-side image optimizer: prevents browser lag & freezing from 300 DPI ultra-high-res print banners
  const optimizeBannerImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.width;
        let height = img.height;
        const maxDimension = 2800;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const optimized = new File([blob], `${cleanName}.webp`, {
              type: "image/webp",
            });
            resolve(optimized);
          },
          "image/webp",
          0.92
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  const processSelectedFile = async (file: File) => {
    setErrorMsg("");
    setSuccessMsg("");

    const fileName = file.name.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|svg|jfif)$/i.test(fileName);

    if (!isImage) {
      if (
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".psd") ||
        fileName.endsWith(".ai") ||
        fileName.endsWith(".cdr")
      ) {
        const ext = file.name.split(".").pop()?.toUpperCase();
        setErrorMsg(
          `File banner berformat .${ext} adalah format cetak/dokumen. Silakan buka di software desain Anda (Canva/Photoshop/Illustrator) dan simpan/ekspor sebagai gambar JPG, PNG, atau WEBP agar dapat tampil di website.`
        );
      } else {
        setErrorMsg(
          "Format file tidak didukung. Harap gunakan file gambar JPG, PNG, WEBP, atau SVG."
        );
      }
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMsg(
        `Ukuran file (${sizeMB}MB) melebihi batas 50MB. Harap perkecil resolusi file banner Anda ke ukuran standar web (misal: 2560 x 960 px).`
      );
      return;
    }

    // Optimize raster images (PNG, JPG, WEBP) to web-friendly resolution to prevent payload limits
    let fileToUse = file;
    if (!fileName.endsWith(".svg")) {
      setIsOptimizing(true);
      try {
        fileToUse = await optimizeBannerImage(file);
      } catch {
        fileToUse = file;
      } finally {
        setIsOptimizing(false);
      }
    }

    setFileToUpload(fileToUse);
    const localUrl = URL.createObjectURL(fileToUse);
    setPreviewUrl(localUrl);

    const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase();
    if (!title) {
      setTitle(autoTitle);
    }

    // Direct automatic publish if enabled
    if (autoPublish) {
      await autoPublishBanner(fileToUse, autoTitle);
    }
  };

  const autoPublishBanner = async (file: File, fallbackTitle: string) => {
    setSubmitting(true);
    setUploadProgress(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      let finalImageUrl = "";
      try {
        const res = await fetch("/api/admin/banners/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) finalImageUrl = data.url;
        }
      } catch (err) {
        console.warn("Upload API error, using base64 fallback:", err);
      }

      if (!finalImageUrl) {
        finalImageUrl = await fileToBase64(file);
      }

      if (!finalImageUrl) {
        throw new Error("Gagal memproses gambar banner.");
      }

      const effectiveTitle = (title || fallbackTitle || "BANNER ARVANTA STUDIO").trim();
      const resCreate = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: effectiveTitle,
          subtitle: subtitle || "Promo & Penawaran Spesial Arvanta Studio",
          badge: badge || "PROMO SPESIAL",
          imageUrl: finalImageUrl,
          targetUrl: targetUrl || "/order",
          sortOrder: Number(sortOrder) || banners.length + 1,
          isActive: true,
        }),
      });

      const createData = await resCreate.json();
      if (resCreate.ok && createData.success && createData.banner) {
        setBanners((prev) => [
          createData.banner,
          ...prev.filter((b) => b.id !== createData.banner.id),
        ]);
        setSuccessMsg(`✓ Banner "${effectiveTitle}" berhasil diunggah dan langsung aktif di Beranda!`);
        setTimeout(() => setSuccessMsg(""), 6000);

        setFileToUpload(null);
        setPreviewUrl("");
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        broadcastLiveUpdate();
        await loadData();
      } else {
        throw new Error(createData.error || "Gagal menyimpan banner ke database.");
      }
    } catch (err: any) {
      console.error("Auto publish error:", err);
      setErrorMsg(err.message || "Gagal mengunggah banner otomatis.");
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload file to server
  const handleUploadFile = async (): Promise<string | null> => {
    if (!fileToUpload) return imageUrl || null;

    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengunggah file banner ke server.");
      }

      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        return data.url;
      }
      return null;
    } catch (err: any) {
      console.error("Upload error:", err);
      return null;
    } finally {
      setUploadProgress(false);
    }
  };

  // Create new banner: automatic, seamless, zero blocking error popups
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // If user clicked without selecting a file or URL, open file selector immediately
    if (!fileToUpload && !imageUrl) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl;
      if (fileToUpload) {
        try {
          const uploaded = await handleUploadFile();
          if (uploaded) {
            finalImageUrl = uploaded;
          }
        } catch (err) {
          console.error("Upload handler failed:", err);
        }

        // Guaranteed fallback: If server disk upload did not return a URL, convert to Base64 Data URL!
        if (!finalImageUrl) {
          try {
            finalImageUrl = await fileToBase64(fileToUpload);
          } catch {}
        }
      }

      if (!finalImageUrl) {
        setErrorMsg("Gagal mengunggah gambar. Pastikan format file adalah JPG, PNG, WEBP, atau SVG.");
        setSubmitting(false);
        return;
      }

      const effectiveTitle = (
        title ||
        fileToUpload?.name?.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase() ||
        "BANNER PROMOSI ARVANTA"
      ).trim();

      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: effectiveTitle,
          subtitle: subtitle || null,
          badge: badge || "PROMO SPESIAL",
          imageUrl: finalImageUrl,
          targetUrl: targetUrl || "/order",
          sortOrder: Number(sortOrder) || 0,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTitle("");
        setSubtitle("");
        setBadge("PROMO SPESIAL");
        setTargetUrl("/order");
        setFileToUpload(null);
        setPreviewUrl("");
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        if (data.banner) {
          setBanners((prev) => [
            data.banner,
            ...prev.filter((b) => b.id !== data.banner.id),
          ]);
        }

        setSuccessMsg("✓ Banner berhasil diunggah dan langsung aktif di Beranda!");
        setTimeout(() => setSuccessMsg(""), 5000);

        // Reload data and broadcast to all live tabs without refresh
        broadcastLiveUpdate();
        await loadData();
      } else {
        setErrorMsg(data.error || "Gagal menyimpan banner ke database.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses banner.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengubah status banner.");
      }

      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !currentStatus } : b))
      );
      setSuccessMsg("Status banner berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui status.");
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus banner.");
      }

      setBanners((prev) => prev.filter((b) => b.id !== id));
      setSuccessMsg("Banner berhasil dihapus!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus banner.");
    }
  };

  // Save Flash Sale Settings
  const handleSaveFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/flash-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: flashSaleActive,
          title: flashSaleTitle,
          subtitle: flashSaleSubtitle,
          discountPercent: flashSaleDiscount,
          voucherCode: flashSaleVoucher,
          endTime: new Date(flashSaleEndTime).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan Flash Sale.");

      broadcastLiveUpdate();
      setSuccessMsg("Pengaturan Flash Sale & Promo berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9D7CF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-deep-charcoal/60">
              Real-time Sync Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal mt-1">
            Banner Promosi &amp; Flash Sale Studio
          </h1>
          <p className="text-xs text-deep-charcoal/70 mt-1">
            Kelola banner lanskap 160 x 60 cm dan promosi Flash Sale. Setiap banner yang diunggah
            otomatis diperbarui di beranda pengguna tanpa perlu refresh.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-warm-ivory border border-[#D9D7CF] text-xs font-semibold text-deep-charcoal hover:bg-muted-olive/10 transition-colors rounded-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Success Notification (Clean, auto-fading) */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-xs font-bold text-red-600 hover:text-red-800 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: FLASH SALE SETTINGS */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9D7CF]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-muted-olive text-warm-ivory flex items-center justify-center">
              <Tag className="w-4 h-4 text-warm-ivory" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
                Konfigurasi Flash Sale &amp; Promo Khusus
              </h2>
              <p className="text-[11px] text-deep-charcoal/60">
                Aktifkan bar hitung mundur dan diskon khusus promo di halaman depan
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <span className="text-xs font-semibold text-deep-charcoal">
              {flashSaleActive ? "Status: AKTIF" : "Status: NONAKTIF"}
            </span>
            <input
              type="checkbox"
              checked={flashSaleActive}
              onChange={(e) => setFlashSaleActive(e.target.checked)}
              className="w-4 h-4 accent-deep-charcoal cursor-pointer"
            />
          </label>
        </div>

        <form onSubmit={handleSaveFlashSale} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Judul Promo Flash Sale</label>
            <input
              type="text"
              value={flashSaleTitle}
              onChange={(e) => setFlashSaleTitle(e.target.value)}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              placeholder="PROMO SPESIAL ARVANTA STUDIO"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Kode Kupon / Voucher</label>
            <input
              type="text"
              value={flashSaleVoucher}
              onChange={(e) => setFlashSaleVoucher(e.target.value)}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold focus:outline-hidden focus:border-deep-charcoal"
              placeholder="PROMO20"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Persentase Diskon (%)</label>
            <input
              type="number"
              value={flashSaleDiscount}
              onChange={(e) => setFlashSaleDiscount(e.target.value)}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              placeholder="20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Subjudul / Keterangan Penawaran</label>
            <input
              type="text"
              value={flashSaleSubtitle}
              onChange={(e) => setFlashSaleSubtitle(e.target.value)}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              placeholder="Diskon Pembuatan Website & Desain Grafis Khusus Hari Ini!"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Batas Waktu Berakhir (Countdown)</label>
            <input
              type="datetime-local"
              value={flashSaleEndTime}
              onChange={(e) => setFlashSaleEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal font-mono"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Pengaturan Promo Flash Sale"}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: UPLOAD NEW BANNER (160 x 60 cm Landscape) */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#D9D7CF]/60">
          <div className="w-8 h-8 rounded-xs bg-deep-charcoal text-warm-ivory flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
              Tambah Banner Baru (Ukuran 160 x 60 cm)
            </h2>
            <p className="text-[11px] text-deep-charcoal/60">
              Format: JPG, PNG, WEBP, atau SVG. Rasio landscape 160:60 (8:3) agar tampil sempurna tanpa terpotong.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateBanner} className="space-y-6 text-xs">
          {/* File Upload Box with 160x60 Guide */}
          <div>
            <label className="block font-semibold mb-2">
              Unggah File Gambar Banner (Rasio 160 × 60 cm / 8:3)
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processSelectedFile(file);
              }}
              className={`border-2 border-dashed rounded-xs p-4 sm:p-6 transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-[#D9D7CF] hover:border-deep-charcoal bg-warm-ivory/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg,.jfif"
                onChange={handleFileChange}
                className="hidden"
                id="banner-file-input"
              />

              <label
                htmlFor="banner-file-input"
                className="flex flex-col items-center justify-center cursor-pointer space-y-2"
              >
                <Upload className="w-8 h-8 text-deep-charcoal/50" />
                <span className="font-semibold text-deep-charcoal text-center">
                  {fileToUpload
                    ? `✓ ${fileToUpload.name} (${(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB)`
                    : "Klik atau Tarik File Banner dari Komputer ke Sini"}
                </span>
                {isOptimizing && (
                  <span className="text-[11px] font-mono text-emerald-600 animate-pulse font-semibold">
                    ⏳ Mengoptimalkan resolusi file banner agar cepat dimuat dan tidak ngeleg...
                  </span>
                )}
                <span className="text-[11px] text-deep-charcoal/60 text-center max-w-md">
                  📐 <strong>Ukuran Standar: 160 x 60 cm</strong> (Rasio Landscape 8:3). Rekomendasi
                  resolusi web: <strong>1920 × 720 px</strong> atau <strong>2560 × 960 px</strong>.
                  Maksimal 50MB. Format: JPG, PNG, WEBP, SVG.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between mt-2.5 px-1 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-950">
                  ⚡ Terbitkan Otomatis saat file dipilih (Upload langsung masuk ke daftar &amp; tampil di user)
                </span>
              </label>
              <span className="text-[11px] text-emerald-700 hidden sm:inline font-mono">
                {autoPublish ? "Aktif: 1-Klik Otomatis" : "Manual: Isi form dulu"}
              </span>
            </div>
          </div>

          {/* Real-time Preview in 160x60 container */}
          {(previewUrl || imageUrl) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-muted-olive" />
                  <span>Preview Banner (Rasio 160 × 60 cm / Landscape 8:3):</span>
                </span>
                <span className="text-[10px] font-mono text-deep-charcoal/60 uppercase">
                  Tampilan Tanpa Terpotong
                </span>
              </div>

              <div className="relative w-full aspect-[8/3] max-h-[320px] bg-deep-charcoal rounded-xs overflow-hidden border border-[#D9D7CF] shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || imageUrl}
                  alt="Preview Banner"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-deep-charcoal/90 text-warm-ivory text-[10px] font-bold rounded-xs border border-warm-ivory/20">
                  {badge || "PROMO SPESIAL"}
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] font-mono text-warm-ivory/50">
                  160 × 60 cm
                </div>
              </div>

              {/* Instant Publish Action directly under preview */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-emerald-900">
                      File Banner Siap Diterbitkan ({fileToUpload?.name || "Banner Baru"})
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Klik tombol di samping untuk langsung menyimpan ke database dan menampilkannya di Beranda.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploadProgress || isOptimizing}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {submitting || uploadProgress
                      ? "Menyimpan ke Beranda..."
                      : "Simpan & Terbitkan Sekarang"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Judul Banner</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Otomatis dari nama file jika kosong"
                className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="PROMO SPESIAL"
                className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Urutan Tampil (Sort Order)</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Subjudul / Deskripsi Pendek</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Contoh: Diskon Pembuatan Website & Desain Grafis Khusus Hari Ini!"
                className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">URL Tujuan Saat Diklik</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/order?promo=1111"
                className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal font-mono"
              />
            </div>
          </div>

          {fileToUpload && (
            <div className="p-3 bg-warm-ivory border border-[#D9D7CF] text-xs text-deep-charcoal rounded-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                File terpilih: <strong>{fileToUpload.name}</strong> ({(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || uploadProgress || isOptimizing}
              className="px-6 py-3.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isOptimizing
                  ? "Mengoptimalkan Banner..."
                  : uploadProgress
                  ? "Mengunggah Gambar ke Server..."
                  : submitting
                  ? "Menyimpan Banner..."
                  : "Upload & Terbitkan Banner"}
              </span>
            </button>

            {!fileToUpload && !imageUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3.5 border border-deep-charcoal text-deep-charcoal text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-deep-charcoal hover:text-warm-ivory transition-colors cursor-pointer text-center"
              >
                Pilih File Banner dari Komputer
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECTION 3: LIST OF ACTIVE BANNERS */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D9D7CF]/60">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
              Daftar Banner Beranda ({banners.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-deep-charcoal/60">
            Auto-slide berurutan berdasarkan sort order
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-deep-charcoal/60">
            Memuat daftar banner...
          </div>
        ) : banners.length === 0 ? (
          <div className="py-12 text-center text-xs text-deep-charcoal/60">
            Belum ada banner yang diunggah. Gunakan formulir di atas untuk mengunggah banner 160 x 60 cm.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="border border-[#D9D7CF] rounded-xs overflow-hidden bg-warm-ivory/20 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail in 160x60 ratio */}
                  <div className="relative w-full aspect-[8/3] bg-deep-charcoal overflow-hidden border-b border-[#D9D7CF]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const retryCount = Number(target.dataset.retry || "0");
                        if (retryCount === 0 && b.imageUrl.startsWith("/uploads/")) {
                          target.dataset.retry = "1";
                          target.src = "/api" + b.imageUrl;
                          return;
                        }
                        if (retryCount === 1) {
                          target.dataset.retry = "2";
                          target.src = b.imageUrl + (b.imageUrl.includes("?") ? "&" : "?") + "t=" + Date.now();
                          return;
                        }
                        // Fallback UI if image genuinely cannot be read
                        target.style.display = "none";
                        const fallbackEl = target.nextElementSibling as HTMLElement;
                        if (fallbackEl) fallbackEl.style.display = "flex";
                      }}
                    />
                    <div
                      style={{ display: "none" }}
                      className="w-full h-full flex flex-col items-center justify-center bg-deep-charcoal text-warm-ivory p-4 text-center select-none"
                    >
                      <ImageIcon className="w-6 h-6 text-muted-olive mb-1 opacity-80" />
                      <span className="text-[11px] font-bold text-warm-ivory line-clamp-1">{b.title}</span>
                      <span className="text-[9px] text-warm-ivory/60 font-mono mt-0.5">160 × 60 cm</span>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-deep-charcoal/90 text-warm-ivory text-[9px] font-bold rounded-xs border border-warm-ivory/20 shadow-xs">
                      {b.badge || "PROMO"}
                    </div>
                    <div className="absolute bottom-1 right-2 text-[9px] font-mono text-warm-ivory/60">
                      160 × 60 cm
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-deep-charcoal/60">
                        Urutan: #{b.sortOrder}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                          b.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {b.isActive ? "Aktif di Beranda" : "Dinonaktifkan"}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-deep-charcoal line-clamp-1">{b.title}</h3>
                    {b.subtitle && (
                      <p className="text-[11px] text-deep-charcoal/70 line-clamp-2">{b.subtitle}</p>
                    )}

                    {b.targetUrl && (
                      <div className="text-[10px] font-mono text-muted-olive truncate">
                        Link: {b.targetUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-[#D9D7CF] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(b.id, b.isActive)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-xs transition-colors ${
                      b.isActive
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {b.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                    title="Hapus Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
