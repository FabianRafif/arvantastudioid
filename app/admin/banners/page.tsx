"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
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
  Clock,
  Copy,
  Edit2,
  Search,
  Filter,
  Megaphone,
  Bell,
  Sparkles,
  AlertTriangle,
  FileText,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string;
  targetUrl: string | null;
  status?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface Announcement {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  summary: string | null;
  imageUrl: string | null;
  priority: "NORMAL" | "PENTING" | "URGENT";
  status: "DRAFT" | "PUBLISHED";
  isActive: boolean;
  publishDate: string;
  endDate: string | null;
  authorName: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const ANNOUNCEMENT_CATEGORIES = [
  { id: "PROMO", label: "Promo & Diskon" },
  { id: "LAYANAN", label: "Layanan Baru" },
  { id: "HARGA", label: "Pembaruan Tarif" },
  { id: "OPERASIONAL", label: "Libur & Jadwal Operasional" },
  { id: "MAINTENANCE", label: "Pemeliharaan Sistem / Maintenance" },
  { id: "INFO_PENTING", label: "Informasi Penting & Regulasi" },
];

export default function AdminBannersPage() {
  // Primary Tab state: "banners" | "announcements"
  const [activeTab, setActiveTab] = useState<"banners" | "announcements">("banners");

  // Global status
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ==========================================
  // TAB 1: BANNER STATE
  // ==========================================
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Banner Form state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerBadge, setBannerBadge] = useState("PROMO SPESIAL");
  const [bannerTargetUrl, setBannerTargetUrl] = useState("/order");
  const [bannerSortOrder, setBannerSortOrder] = useState(1);
  const [bannerStatus, setBannerStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [bannerStartDate, setBannerStartDate] = useState("");
  const [bannerEndDate, setBannerEndDate] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("");
  const [autoPublish, setAutoPublish] = useState(true);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [isOptimizingBanner, setIsOptimizingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  // Banner Filter & Search
  const [bannerSearch, setBannerSearch] = useState("");
  const [bannerStatusFilter, setBannerStatusFilter] = useState("ALL");

  // Flash Sale Settings state (collapsible)
  const [showFlashSaleConfig, setShowFlashSaleConfig] = useState(false);
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const [flashSaleTitle, setFlashSaleTitle] = useState("PROMO SPESIAL — ARVANTA STUDIO");
  const [flashSaleSubtitle, setFlashSaleSubtitle] = useState("Diskon Spesial Pembuatan Website & Desain Grafis Khusus Hari Ini!");
  const [flashSaleDiscount, setFlashSaleDiscount] = useState("20");
  const [flashSaleVoucher, setFlashSaleVoucher] = useState("PROMO20");
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // ==========================================
  // TAB 2: ANNOUNCEMENT STATE
  // ==========================================
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnounceId, setEditingAnnounceId] = useState<string | null>(null);

  // Announcement Form state
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceCategory, setAnnounceCategory] = useState("PROMO");
  const [announcePriority, setAnnouncePriority] = useState<"NORMAL" | "PENTING" | "URGENT">("NORMAL");
  const [announceStatus, setAnnounceStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [announcePublishDate, setAnnouncePublishDate] = useState(new Date().toISOString().slice(0, 16));
  const [announceEndDate, setAnnounceEndDate] = useState("");
  const [announceSummary, setAnnounceSummary] = useState("");
  const [announceContent, setAnnounceContent] = useState("");
  const [announceImageUrl, setAnnounceImageUrl] = useState("");
  const [announceFile, setAnnounceFile] = useState<File | null>(null);
  const [announcePreviewUrl, setAnnouncePreviewUrl] = useState("");
  const [showAnnouncePreviewModal, setShowAnnouncePreviewModal] = useState(false);
  const announceFileInputRef = useRef<HTMLInputElement | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Announcement Filter & Search
  const [announceSearch, setAnnounceSearch] = useState("");
  const [announceCategoryFilter, setAnnounceCategoryFilter] = useState("ALL");
  const [announcePriorityFilter, setAnnouncePriorityFilter] = useState("ALL");
  const [announceStatusFilter, setAnnounceStatusFilter] = useState("ALL");

  // ==========================================
  // DATA LOADING
  // ==========================================
  const loadData = async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const [resBanners, resPublic, resAnnouncements] = await Promise.all([
        fetch(`/api/admin/banners?t=${ts}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch(`/api/banners?t=${ts}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch(`/api/admin/announcements?t=${ts}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      ]);

      if (resBanners.ok) {
        const data = await resBanners.json();
        if (Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
      }

      if (resPublic.ok) {
        const pubData = await resPublic.json();
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

      if (resAnnouncements.ok) {
        const data = await resAnnouncements.json();
        if (Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
      }
    } catch {
      setErrorMsg("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Client-side image optimizer for banners
  const optimizeImage = (file: File, maxDim = 2800): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload image to server with base64 fallback for serverless
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (err) {
      console.warn("Disk upload failed, using Data URL fallback:", err);
    }
    return await fileToBase64(file);
  };

  // ==========================================
  // BANNER HANDLERS
  // ==========================================
  const handleBannerFileSelected = async (file: File) => {
    setErrorMsg("");
    setSuccessMsg("");

    const fileName = file.name.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|svg|jfif)$/i.test(fileName);
    if (!isImage) {
      setErrorMsg("Format file tidak didukung. Harap gunakan gambar JPG, PNG, WEBP, atau SVG.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("Ukuran file melebihi batas 50MB. Harap perkecil resolusi file banner Anda.");
      return;
    }

    let fileToUse = file;
    if (!fileName.endsWith(".svg")) {
      setIsOptimizingBanner(true);
      try {
        fileToUse = await optimizeImage(file, 2800);
      } catch {
        fileToUse = file;
      } finally {
        setIsOptimizingBanner(false);
      }
    }

    setBannerFile(fileToUse);
    const localUrl = URL.createObjectURL(fileToUse);
    setBannerPreviewUrl(localUrl);

    const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase();
    if (!bannerTitle) setBannerTitle(autoTitle);

    // Auto publish if in Add mode and autoPublish is true
    if (!editingBannerId && autoPublish) {
      await saveBannerDirect(fileToUse, autoTitle, "PUBLISHED");
    }
  };

  const saveBannerDirect = async (
    file: File | null,
    fallbackTitle: string,
    forcedStatus?: "DRAFT" | "PUBLISHED"
  ) => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      let finalImg = bannerImageUrl;
      if (file) {
        finalImg = await uploadImageToServer(file);
      }

      if (!finalImg) {
        throw new Error("File gambar banner belum dipilih.");
      }

      const effectiveTitle = (bannerTitle || fallbackTitle || "BANNER ARVANTA STUDIO").trim();
      const effStatus = forcedStatus || bannerStatus;

      const payload = {
        title: effectiveTitle,
        subtitle: bannerSubtitle || null,
        badge: bannerBadge || "PROMO SPESIAL",
        imageUrl: finalImg,
        targetUrl: bannerTargetUrl || "/order",
        sortOrder: Number(bannerSortOrder) || banners.length + 1,
        status: effStatus,
        isActive: effStatus === "PUBLISHED",
        startDate: bannerStartDate ? new Date(bannerStartDate).toISOString() : null,
        endDate: bannerEndDate ? new Date(bannerEndDate).toISOString() : null,
      };

      let res: Response;
      if (editingBannerId) {
        res = await fetch(`/api/admin/banners/${editingBannerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan banner.");
      }

      setSuccessMsg(
        editingBannerId
          ? `✓ Banner "${effectiveTitle}" berhasil diperbarui!`
          : `✓ Banner "${effectiveTitle}" berhasil diterbitkan dan langsung tayang di beranda!`
      );
      setTimeout(() => setSuccessMsg(""), 6000);

      // Reset form
      resetBannerForm();
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerBadge("PROMO SPESIAL");
    setBannerTargetUrl("/order");
    setBannerSortOrder(banners.length + 1);
    setBannerStatus("PUBLISHED");
    setBannerStartDate("");
    setBannerEndDate("");
    setBannerImageUrl("");
    setBannerFile(null);
    setBannerPreviewUrl("");
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
  };

  const handleEditBanner = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle || "");
    setBannerBadge(b.badge || "PROMO SPESIAL");
    setBannerTargetUrl(b.targetUrl || "/order");
    setBannerSortOrder(b.sortOrder);
    setBannerStatus(b.status === "DRAFT" || !b.isActive ? "DRAFT" : "PUBLISHED");
    setBannerStartDate(b.startDate ? new Date(b.startDate).toISOString().slice(0, 16) : "");
    setBannerEndDate(b.endDate ? new Date(b.endDate).toISOString().slice(0, 16) : "");
    setBannerImageUrl(b.imageUrl);
    setBannerFile(null);
    setBannerPreviewUrl(b.imageUrl);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicateBanner = async (id: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/banners/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal menggandakan banner.");

      setSuccessMsg("✓ Banner berhasil digandakan ke status DRAFT!");
      setTimeout(() => setSuccessMsg(""), 5000);
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menggandakan banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBannerStatus = async (id: string, currentActive: boolean) => {
    try {
      const nextStatus = currentActive ? "DRAFT" : "PUBLISHED";
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status banner.");

      setSuccessMsg(`Status banner diubah menjadi ${nextStatus}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui status.");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus banner.");

      setSuccessMsg("Banner berhasil dihapus.");
      setTimeout(() => setSuccessMsg(""), 4000);
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus banner.");
    }
  };

  // Flash Sale Settings
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

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan Flash Sale.");

      broadcastLiveUpdate();
      setSuccessMsg("Pengaturan Flash Sale berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // ANNOUNCEMENT HANDLERS
  // ==========================================
  const handleAnnounceFileSelected = async (file: File) => {
    setErrorMsg("");
    const isImage = /\.(jpg|jpeg|png|webp|svg|jfif)$/i.test(file.name);
    if (!isImage) {
      setErrorMsg("Format gambar pendukung tidak didukung.");
      return;
    }
    setAnnounceFile(file);
    setAnnouncePreviewUrl(URL.createObjectURL(file));
  };

  const insertContentFormat = (prefix: string, suffix = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = announceContent.substring(start, end);
    const replacement = `${prefix}${selected || "teks"}${suffix}`;
    const nextContent =
      announceContent.substring(0, start) + replacement + announceContent.substring(end);
    setAnnounceContent(nextContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  const saveAnnouncementDirect = async (forcedStatus?: "DRAFT" | "PUBLISHED") => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      if (!announceTitle.trim() || !announceContent.trim()) {
        throw new Error("Judul dan isi pengumuman wajib diisi.");
      }

      let finalImg = announceImageUrl;
      if (announceFile) {
        finalImg = await uploadImageToServer(announceFile);
      }

      const effStatus = forcedStatus || announceStatus;
      const payload = {
        title: announceTitle.trim(),
        category: announceCategory,
        priority: announcePriority,
        status: effStatus,
        publishDate: announcePublishDate ? new Date(announcePublishDate).toISOString() : new Date().toISOString(),
        endDate: announceEndDate ? new Date(announceEndDate).toISOString() : null,
        summary: announceSummary.trim() || null,
        content: announceContent,
        imageUrl: finalImg || null,
      };

      let res: Response;
      if (editingAnnounceId) {
        res = await fetch(`/api/admin/announcements/${editingAnnounceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan pengumuman.");
      }

      setSuccessMsg(
        editingAnnounceId
          ? `✓ Pengumuman "${announceTitle}" berhasil diperbarui!`
          : `✓ Pengumuman "${announceTitle}" berhasil ${effStatus === "PUBLISHED" ? "diterbitkan" : "disimpan sebagai draft"}!`
      );
      setTimeout(() => setSuccessMsg(""), 6000);

      resetAnnounceForm();
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pengumuman.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAnnounceForm = () => {
    setEditingAnnounceId(null);
    setAnnounceTitle("");
    setAnnounceCategory("PROMO");
    setAnnouncePriority("NORMAL");
    setAnnounceStatus("PUBLISHED");
    setAnnouncePublishDate(new Date().toISOString().slice(0, 16));
    setAnnounceEndDate("");
    setAnnounceSummary("");
    setAnnounceContent("");
    setAnnounceImageUrl("");
    setAnnounceFile(null);
    setAnnouncePreviewUrl("");
    if (announceFileInputRef.current) announceFileInputRef.current.value = "";
  };

  const handleEditAnnouncement = (a: Announcement) => {
    setEditingAnnounceId(a.id);
    setAnnounceTitle(a.title);
    setAnnounceCategory(a.category);
    setAnnouncePriority(a.priority);
    setAnnounceStatus(a.status);
    setAnnouncePublishDate(a.publishDate ? new Date(a.publishDate).toISOString().slice(0, 16) : "");
    setAnnounceEndDate(a.endDate ? new Date(a.endDate).toISOString().slice(0, 16) : "");
    setAnnounceSummary(a.summary || "");
    setAnnounceContent(a.content || "");
    setAnnounceImageUrl(a.imageUrl || "");
    setAnnounceFile(null);
    setAnnouncePreviewUrl(a.imageUrl || "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicateAnnouncement = async (id: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/announcements/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal menggandakan pengumuman.");

      setSuccessMsg("✓ Pengumuman berhasil digandakan ke status DRAFT!");
      setTimeout(() => setSuccessMsg(""), 5000);
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menggandakan pengumuman.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAnnounceStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === "PUBLISHED" }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status pengumuman.");

      setSuccessMsg(`Status pengumuman diubah menjadi ${nextStatus}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui status.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus pengumuman.");

      setSuccessMsg("Pengumuman berhasil dihapus.");
      setTimeout(() => setSuccessMsg(""), 4000);
      broadcastLiveUpdate();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus pengumuman.");
    }
  };

  // ==========================================
  // FILTERED LISTS
  // ==========================================
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const matchSearch =
        !bannerSearch ||
        b.title.toLowerCase().includes(bannerSearch.toLowerCase()) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(bannerSearch.toLowerCase())) ||
        (b.badge && b.badge.toLowerCase().includes(bannerSearch.toLowerCase()));

      let matchStatus = true;
      if (bannerStatusFilter === "PUBLISHED") {
        matchStatus = b.isActive && b.status !== "DRAFT";
      } else if (bannerStatusFilter === "DRAFT") {
        matchStatus = !b.isActive || b.status === "DRAFT";
      }

      return matchSearch && matchStatus;
    });
  }, [banners, bannerSearch, bannerStatusFilter]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchSearch =
        !announceSearch ||
        a.title.toLowerCase().includes(announceSearch.toLowerCase()) ||
        (a.summary && a.summary.toLowerCase().includes(announceSearch.toLowerCase())) ||
        a.content.toLowerCase().includes(announceSearch.toLowerCase());

      const matchCat =
        announceCategoryFilter === "ALL" || a.category === announceCategoryFilter;

      const matchPriority =
        announcePriorityFilter === "ALL" || a.priority === announcePriorityFilter;

      const matchStatus =
        announceStatusFilter === "ALL" || a.status === announceStatusFilter;

      return matchSearch && matchCat && matchPriority && matchStatus;
    });
  }, [
    announcements,
    announceSearch,
    announceCategoryFilter,
    announcePriorityFilter,
    announceStatusFilter,
  ]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9D7CF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-deep-charcoal/60">
              Real-time Database Sync Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal mt-1">
            Banner &amp; Pengumuman Studio
          </h1>
          <p className="text-xs text-deep-charcoal/70 mt-1">
            Kendali terpusat publikasi banner slider beranda dan pengumuman resmi website Arvanta Studio.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-warm-ivory border border-[#D9D7CF] text-xs font-semibold text-deep-charcoal hover:bg-muted-olive/10 transition-colors rounded-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#D9D7CF]">
        <button
          type="button"
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold font-space uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "banners"
              ? "border-[#FF9857] text-deep-charcoal bg-white/60"
              : "border-transparent text-deep-charcoal/60 hover:text-deep-charcoal hover:bg-white/30"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-muted-olive" />
          <span>1. Banner Beranda</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-deep-charcoal text-warm-ivory font-mono">
            {banners.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold font-space uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "announcements"
              ? "border-[#FF9857] text-deep-charcoal bg-white/60"
              : "border-transparent text-deep-charcoal/60 hover:text-deep-charcoal hover:bg-white/30"
          }`}
        >
          <Megaphone className="w-4 h-4 text-[#FF9857]" />
          <span>2. Pengumuman &amp; Berita</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FF9857] text-[#2D2D2D] font-mono font-bold">
            {announcements.length}
          </span>
        </button>

        <Link
          href="/admin/content"
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold font-space uppercase tracking-wider border-b-2 border-transparent text-deep-charcoal/60 hover:text-deep-charcoal hover:bg-white/30 transition-all"
          title="Kelola Logo & Teks Berjalan di Beranda"
        >
          <Sparkles className="w-4 h-4 text-[#FF9857]" />
          <span>3. Running Text Ticker ↗</span>
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 rounded-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-300 text-xs text-red-900 rounded-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-red-700 hover:text-red-950 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: BANNER BERANDA CONTENT */}
      {/* ========================================================= */}
      {activeTab === "banners" && (
        <div className="space-y-8">
          {/* Collapsible Flash Sale Configuration */}
          <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFlashSaleConfig(!showFlashSaleConfig)}
              className="w-full p-4 flex items-center justify-between bg-warm-ivory/50 hover:bg-warm-ivory transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-muted-olive" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-deep-charcoal">
                    Pengaturan Flash Sale &amp; Countdown Bar (Opsional)
                  </h3>
                  <span className="text-[11px] text-deep-charcoal/60">
                    Status: {flashSaleActive ? "AKTIF di Website" : "NONAKTIF"} • Kupon: {flashSaleVoucher} ({flashSaleDiscount}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-deep-charcoal/70">
                  {showFlashSaleConfig ? "Tutup" : "Buka Pengaturan"}
                </span>
                {showFlashSaleConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showFlashSaleConfig && (
              <form onSubmit={handleSaveFlashSale} className="p-6 border-t border-[#D9D7CF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between pb-3 border-b border-[#D9D7CF]/60">
                  <span className="font-semibold text-deep-charcoal">Aktifkan Flash Sale Bar di Beranda</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flashSaleActive}
                      onChange={(e) => setFlashSaleActive(e.target.checked)}
                      className="w-4 h-4 accent-deep-charcoal"
                    />
                    <span className="font-bold">{flashSaleActive ? "Status: AKTIF" : "Status: NONAKTIF"}</span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Judul Flash Sale</label>
                  <input
                    type="text"
                    value={flashSaleTitle}
                    onChange={(e) => setFlashSaleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kode Voucher</label>
                  <input
                    type="text"
                    value={flashSaleVoucher}
                    onChange={(e) => setFlashSaleVoucher(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    value={flashSaleDiscount}
                    onChange={(e) => setFlashSaleDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Keterangan Penawaran</label>
                  <input
                    type="text"
                    value={flashSaleSubtitle}
                    onChange={(e) => setFlashSaleSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Batas Waktu Countdown</label>
                  <input
                    type="datetime-local"
                    value={flashSaleEndTime}
                    onChange={(e) => setFlashSaleEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Simpan Pengaturan Flash Sale
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Form Tambah / Edit Banner (160 x 60 cm) */}
          <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9D7CF]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-deep-charcoal text-warm-ivory flex items-center justify-center">
                  {editingBannerId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
                    {editingBannerId ? "Edit Banner Promosi (160 × 60 cm)" : "Tambah Banner Baru (160 × 60 cm)"}
                  </h2>
                  <p className="text-[11px] text-deep-charcoal/60">
                    Format: JPG, PNG, WEBP, atau SVG. Rasio landscape 160:60 (8:3) agar tampil sempurna di running slider beranda.
                  </p>
                </div>
              </div>

              {editingBannerId && (
                <button
                  type="button"
                  onClick={resetBannerForm}
                  className="px-3 py-1.5 border border-[#D9D7CF] hover:border-deep-charcoal text-xs font-semibold rounded-xs text-deep-charcoal cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Container */}
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBanner(true);
                }}
                onDragLeave={() => setIsDraggingBanner(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingBanner(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleBannerFileSelected(file);
                }}
                className={`border-2 border-dashed rounded-xs p-6 transition-all ${
                  isDraggingBanner
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-[#D9D7CF] hover:border-deep-charcoal bg-warm-ivory/30"
                }`}
              >
                <input
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg,.jfif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBannerFileSelected(file);
                  }}
                  className="hidden"
                  id="banner-upload-input"
                />

                <label
                  htmlFor="banner-upload-input"
                  className="flex flex-col items-center justify-center cursor-pointer space-y-2 text-center"
                >
                  <Upload className="w-8 h-8 text-deep-charcoal/50" />
                  <span className="font-semibold text-deep-charcoal text-xs sm:text-sm">
                    {bannerFile
                      ? `✓ ${bannerFile.name} (${(bannerFile.size / (1024 * 1024)).toFixed(2)} MB)`
                      : "Klik atau Tarik File Gambar Banner ke Sini"}
                  </span>
                  {isOptimizingBanner && (
                    <span className="text-[11px] font-mono text-emerald-600 animate-pulse font-semibold">
                      ⏳ Mengoptimalkan resolusi webp 160:60...
                    </span>
                  )}
                  <span className="text-[11px] text-deep-charcoal/60 max-w-md">
                    📐 <strong>Standar: 160 × 60 cm</strong> (Rasio Landscape 8:3). Resolusi web: <strong>1920 × 720 px</strong> atau <strong>2560 × 960 px</strong>. Maksimal 50MB.
                  </span>
                </label>
              </div>

              {!editingBannerId && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xs text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoPublish}
                      onChange={(e) => setAutoPublish(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-950">
                      ⚡ Terbitkan Otomatis saat file dipilih (Upload langsung tayang di slider beranda)
                    </span>
                  </label>
                  <span className="text-[11px] text-emerald-700 hidden sm:inline font-mono">
                    {autoPublish ? "Aktif: 1-Klik Instan" : "Manual: Isi form lalu klik terbitkan"}
                  </span>
                </div>
              )}
            </div>

            {/* 160:60 Live Preview */}
            {(bannerPreviewUrl || bannerImageUrl) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-muted-olive" />
                    <span>Pratinjau Banner (Rasio 160 × 60 cm / 8:3):</span>
                  </span>
                  <span className="text-[10px] font-mono text-deep-charcoal/60 uppercase">
                    Tampilan Sempurna Tanpa Terpotong
                  </span>
                </div>

                <div className="relative w-full aspect-[8/3] max-h-[320px] bg-deep-charcoal rounded-xs overflow-hidden border border-[#D9D7CF] shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerPreviewUrl || bannerImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-deep-charcoal/90 text-warm-ivory text-[10px] font-bold rounded-xs border border-warm-ivory/20">
                    {bannerBadge || "PROMO SPESIAL"}
                  </div>
                  <div className="absolute bottom-2 right-3 text-[10px] font-mono text-warm-ivory/60">
                    160 × 60 cm
                  </div>
                </div>
              </div>
            )}

            {/* Banner Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Judul Banner *</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Contoh: SELAMAT DATANG"
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  placeholder="PROMO SPESIAL / Welcome / Diskon 20%"
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Urutan Tampil (Sort Order)</label>
                <input
                  type="number"
                  value={bannerSortOrder}
                  onChange={(e) => setBannerSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Subjudul / Deskripsi Pendek</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Arvanta Studio - Branding & digital system agency"
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Tujuan Saat Diklik</label>
                <input
                  type="text"
                  value={bannerTargetUrl}
                  onChange={(e) => setBannerTargetUrl(e.target.value)}
                  placeholder="/order atau /services"
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Publikasi</label>
                <select
                  value={bannerStatus}
                  onChange={(e) => setBannerStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-semibold"
                >
                  <option value="PUBLISHED">Published (Tayang di Slider)</option>
                  <option value="DRAFT">Draft (Disimpan, Tidak Tayang)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Jadwal Mulai Tayang (Opsional)</label>
                <input
                  type="datetime-local"
                  value={bannerStartDate}
                  onChange={(e) => setBannerStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jadwal Masa Berakhir (Opsional)</label>
                <input
                  type="datetime-local"
                  value={bannerEndDate}
                  onChange={(e) => setBannerEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#D9D7CF]/60">
              <button
                type="button"
                onClick={() => saveBannerDirect(bannerFile, bannerTitle, "PUBLISHED")}
                disabled={submitting || isOptimizingBanner}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Menyimpan ke Beranda..."
                    : editingBannerId
                    ? "Simpan & Terbitkan Perubahan"
                    : "Upload & Terbitkan Banner"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => saveBannerDirect(bannerFile, bannerTitle, "DRAFT")}
                disabled={submitting || isOptimizingBanner}
                className="px-5 py-3 bg-warm-ivory border border-deep-charcoal text-deep-charcoal hover:bg-deep-charcoal hover:text-warm-ivory text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Simpan Sebagai Draft
              </button>

              {editingBannerId && (
                <button
                  type="button"
                  onClick={resetBannerForm}
                  className="px-4 py-3 text-xs text-deep-charcoal/70 hover:text-deep-charcoal underline"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </div>

          {/* DAFTAR BANNER BERANDA */}
          <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9D7CF]/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-olive" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
                  Daftar Banner Beranda ({filteredBanners.length})
                </h2>
              </div>

              {/* Search & Status Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-deep-charcoal/50" />
                  <input
                    type="text"
                    value={bannerSearch}
                    onChange={(e) => setBannerSearch(e.target.value)}
                    placeholder="Cari banner..."
                    className="pl-8 pr-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs w-48 focus:outline-hidden"
                  />
                </div>

                <select
                  value={bannerStatusFilter}
                  onChange={(e) => setBannerStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs font-semibold"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PUBLISHED">Published (Aktif)</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-deep-charcoal/60">
                Memuat daftar banner...
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="py-12 text-center text-xs text-deep-charcoal/60">
                Belum ada banner yang sesuai. Gunakan formulir di atas untuk mengunggah banner 160 × 60 cm.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBanners.map((b) => {
                  const isPublished = b.isActive && b.status !== "DRAFT";

                  return (
                    <div
                      key={b.id}
                      className="border border-[#D9D7CF] rounded-xs overflow-hidden bg-warm-ivory/20 flex flex-col justify-between shadow-xs hover:border-deep-charcoal transition-all group"
                    >
                      <div>
                        {/* 160:60 Thumbnail */}
                        <div className="relative w-full aspect-[8/3] bg-deep-charcoal overflow-hidden border-b border-[#D9D7CF]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-deep-charcoal/90 text-warm-ivory text-[9px] font-bold rounded-xs border border-warm-ivory/20">
                            {b.badge || "PROMO"}
                          </div>
                          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-warm-ivory/60">
                            Urutan #{b.sortOrder}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                                isPublished
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isPublished ? "● Published (Aktif)" : "○ Draft (Nonaktif)"}
                            </span>

                            <span className="text-[10px] font-mono text-deep-charcoal/60">
                              Sort #{b.sortOrder}
                            </span>
                          </div>

                          <h3 className="font-bold text-deep-charcoal line-clamp-1">{b.title}</h3>
                          {b.subtitle && (
                            <p className="text-[11px] text-deep-charcoal/70 line-clamp-2">{b.subtitle}</p>
                          )}

                          {b.targetUrl && (
                            <div className="text-[10px] font-mono text-muted-olive truncate">
                              Link: {b.targetUrl}
                            </div>
                          )}

                          {(b.startDate || b.endDate) && (
                            <div className="text-[10px] font-mono text-deep-charcoal/60 pt-1 border-t border-[#D9D7CF]/40">
                              📅 {b.startDate ? new Date(b.startDate).toLocaleDateString("id-ID") : "Sekarang"} s/d{" "}
                              {b.endDate ? new Date(b.endDate).toLocaleDateString("id-ID") : "Seterusnya"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="p-3 bg-white border-t border-[#D9D7CF] flex items-center justify-between gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditBanner(b)}
                            className="p-1.5 rounded-xs hover:bg-muted-olive/10 text-deep-charcoal transition-colors cursor-pointer"
                            title="Edit Banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateBanner(b.id)}
                            className="p-1.5 rounded-xs hover:bg-muted-olive/10 text-deep-charcoal transition-colors cursor-pointer"
                            title="Duplikasi Banner"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleBannerStatus(b.id, isPublished)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                              isPublished
                                ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                            }`}
                          >
                            {isPublished ? "Unpublish" : "Terbitkan"}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-1.5 rounded-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PENGUMUMAN & BERITA CONTENT */}
      {/* ========================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-8">
          {/* Form Tambah / Edit Pengumuman */}
          <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9D7CF]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-[#FF9857] text-[#2D2D2D] flex items-center justify-center font-bold">
                  {editingAnnounceId ? <Edit2 className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
                    {editingAnnounceId ? "Edit Pengumuman Studio" : "Buat Pengumuman Baru"}
                  </h2>
                  <p className="text-[11px] text-deep-charcoal/60">
                    Publikasikan informasi promo, rilis layanan, perubahan tarif, jadwal libur, atau status maintenance ke website publik.
                  </p>
                </div>
              </div>

              {editingAnnounceId && (
                <button
                  type="button"
                  onClick={resetAnnounceForm}
                  className="px-3 py-1.5 border border-[#D9D7CF] hover:border-deep-charcoal text-xs font-semibold rounded-xs text-deep-charcoal cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Libur Operasional Idulfitri 1447H & Penyesuaian Layanan"
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategori Pengumuman *</label>
                <select
                  value={announceCategory}
                  onChange={(e) => setAnnounceCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-semibold"
                >
                  {ANNOUNCEMENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tingkat Prioritas</label>
                <select
                  value={announcePriority}
                  onChange={(e) => setAnnouncePriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-semibold"
                >
                  <option value="NORMAL">Normal (Tampil di Pusat Pengumuman)</option>
                  <option value="PENTING">Penting (Tampil di Announcement Bar &amp; Section)</option>
                  <option value="URGENT">Urgent (Announcement Bar Merah Berkedip)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Publikasi</label>
                <select
                  value={announceStatus}
                  onChange={(e) => setAnnounceStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-semibold"
                >
                  <option value="PUBLISHED">Published (Langsung Tayang ke Publik)</option>
                  <option value="DRAFT">Draft (Disimpan Internal Saja)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tanggal Publikasi</label>
                <input
                  type="datetime-local"
                  value={announcePublishDate}
                  onChange={(e) => setAnnouncePublishDate(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jadwal Berakhir (Kedaluwarsa Opsional)</label>
                <input
                  type="datetime-local"
                  value={announceEndDate}
                  onChange={(e) => setAnnounceEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Ringkasan Singkat / Excerpt (Opsional)</label>
                <input
                  type="text"
                  value={announceSummary}
                  onChange={(e) => setAnnounceSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat yang tampil di kartu pengumuman beranda"
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                />
              </div>

              {/* Gambar Pendukung Upload */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-semibold mb-1">Gambar Pendukung / Banner (Opsional)</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={announceFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAnnounceFileSelected(file);
                    }}
                    className="hidden"
                    id="announce-file-input"
                  />
                  <label
                    htmlFor="announce-file-input"
                    className="px-4 py-2 bg-warm-ivory border border-[#D9D7CF] hover:border-deep-charcoal text-xs font-semibold rounded-xs cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{announceFile ? announceFile.name : "Pilih File Gambar Pendukung"}</span>
                  </label>

                  {announcePreviewUrl && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={announcePreviewUrl}
                        alt="Preview"
                        className="w-12 h-8 object-cover rounded-xs border border-[#D9D7CF]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAnnounceFile(null);
                          setAnnounceImageUrl("");
                          setAnnouncePreviewUrl("");
                          if (announceFileInputRef.current) announceFileInputRef.current.value = "";
                        }}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rich Text Editor for Content */}
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold">Isi Konten Pengumuman (Rich Text) *</label>
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 bg-warm-ivory border border-[#D9D7CF] rounded-xs p-1">
                    <button
                      type="button"
                      onClick={() => insertContentFormat("**", "**")}
                      className="px-2 py-0.5 text-xs font-bold hover:bg-white rounded-xs"
                      title="Tebal (Bold)"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentFormat("*", "*")}
                      className="px-2 py-0.5 text-xs italic hover:bg-white rounded-xs"
                      title="Miring (Italic)"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentFormat("### ", "\n")}
                      className="px-2 py-0.5 text-xs font-bold hover:bg-white rounded-xs"
                      title="Judul Bagian (H3)"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentFormat("- ", "\n")}
                      className="px-2 py-0.5 text-xs hover:bg-white rounded-xs"
                      title="Poin List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentFormat("[Link Teks](", ")")}
                      className="px-2 py-0.5 text-xs hover:bg-white rounded-xs"
                      title="Tautan / Link"
                    >
                      🔗 Link
                    </button>
                  </div>
                </div>

                <textarea
                  ref={contentTextareaRef}
                  rows={8}
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman lengkap di sini. Gunakan baris baru dan pemformatan agar mudah dibaca oleh klien & pengunjung..."
                  className="w-full p-3.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal text-xs leading-relaxed font-sans"
                />
                <div className="text-[11px] text-deep-charcoal/50 text-right font-mono">
                  {announceContent.length} karakter
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#D9D7CF]/60">
              <button
                type="button"
                onClick={() => saveAnnouncementDirect("PUBLISHED")}
                disabled={submitting}
                className="px-6 py-3 bg-[#FF9857] hover:bg-[#2D2D2D] text-[#2D2D2D] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Menyimpan..."
                    : editingAnnounceId
                    ? "Simpan & Terbitkan Perubahan"
                    : "Terbitkan Pengumuman"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => saveAnnouncementDirect("DRAFT")}
                disabled={submitting}
                className="px-5 py-3 bg-warm-ivory border border-deep-charcoal text-deep-charcoal hover:bg-deep-charcoal hover:text-warm-ivory text-xs font-bold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Simpan Draft
              </button>

              <button
                type="button"
                onClick={() => setShowAnnouncePreviewModal(true)}
                disabled={!announceTitle || !announceContent}
                className="px-4 py-3 bg-white border border-[#D9D7CF] hover:border-deep-charcoal text-deep-charcoal text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Pengumuman</span>
              </button>

              {editingAnnounceId && (
                <button
                  type="button"
                  onClick={resetAnnounceForm}
                  className="px-4 py-3 text-xs text-deep-charcoal/70 hover:text-deep-charcoal underline"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </div>

          {/* DAFTAR PENGUMUMAN */}
          <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9D7CF]/60">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#FF9857]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-deep-charcoal">
                  Daftar Pengumuman Studio ({filteredAnnouncements.length})
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-deep-charcoal/50" />
                  <input
                    type="text"
                    value={announceSearch}
                    onChange={(e) => setAnnounceSearch(e.target.value)}
                    placeholder="Cari pengumuman..."
                    className="pl-8 pr-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs w-44 focus:outline-hidden"
                  />
                </div>

                <select
                  value={announceCategoryFilter}
                  onChange={(e) => setAnnounceCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs font-semibold"
                >
                  <option value="ALL">Semua Kategori</option>
                  {ANNOUNCEMENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  value={announcePriorityFilter}
                  onChange={(e) => setAnnouncePriorityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs font-semibold"
                >
                  <option value="ALL">Semua Prioritas</option>
                  <option value="URGENT">Urgent</option>
                  <option value="PENTING">Penting</option>
                  <option value="NORMAL">Normal</option>
                </select>

                <select
                  value={announceStatusFilter}
                  onChange={(e) => setAnnounceStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-xs font-semibold"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-deep-charcoal/60">
                Memuat daftar pengumuman...
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="py-12 text-center text-xs text-deep-charcoal/60">
                Belum ada pengumuman yang sesuai. Gunakan formulir di atas untuk membuat pengumuman baru.
              </div>
            ) : (
              <div className="divide-y divide-[#D9D7CF]/60">
                {filteredAnnouncements.map((a) => {
                  const isPublished = a.status === "PUBLISHED" && a.isActive;
                  const isUrgent = a.priority === "URGENT";
                  const isPenting = a.priority === "PENTING";

                  const pubDateStr = new Date(a.publishDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={a.id}
                      className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-warm-ivory/30 px-3 -mx-3 rounded-xs transition-colors"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider bg-warm-ivory border border-[#D9D7CF] text-deep-charcoal">
                            {ANNOUNCEMENT_CATEGORIES.find((c) => c.id === a.category)?.label || a.category}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider ${
                              isUrgent
                                ? "bg-red-600 text-white animate-pulse"
                                : isPenting
                                ? "bg-amber-500 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {a.priority}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPublished
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isPublished ? "● Published" : "○ Draft"}
                          </span>

                          <span className="text-[11px] text-deep-charcoal/50 font-mono">
                            📅 {pubDateStr} {a.endDate ? `• Berakhir: ${new Date(a.endDate).toLocaleDateString("id-ID")}` : ""}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-deep-charcoal line-clamp-1">
                          {a.title}
                        </h3>

                        {a.summary && (
                          <p className="text-xs text-deep-charcoal/70 line-clamp-1">
                            {a.summary}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPublished && (
                          <Link
                            href={`/pengumuman/${a.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-xs hover:bg-muted-olive/10 text-deep-charcoal transition-colors cursor-pointer"
                            title="Buka Halaman Publik"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEditAnnouncement(a)}
                          className="p-1.5 rounded-xs hover:bg-muted-olive/10 text-deep-charcoal transition-colors cursor-pointer"
                          title="Edit Pengumuman"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateAnnouncement(a.id)}
                          className="p-1.5 rounded-xs hover:bg-muted-olive/10 text-deep-charcoal transition-colors cursor-pointer"
                          title="Duplikasi Pengumuman"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleAnnounceStatus(a.id, a.status)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                            isPublished
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                              : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                          }`}
                        >
                          {isPublished ? "Unpublish" : "Terbitkan"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          className="p-1.5 rounded-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ANNOUNCEMENT PREVIEW MODAL */}
      {/* ========================================================= */}
      {showAnnouncePreviewModal && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#EDECE8] border border-[#D8D8D4] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8D8D4] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-deep-charcoal">
                  Pratinjau Tampilan Pengumuman Publik
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAnnouncePreviewModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-deep-charcoal hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-[#D8D8D4] rounded-xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase bg-[#EDECE8] text-deep-charcoal">
                  {ANNOUNCEMENT_CATEGORIES.find((c) => c.id === announceCategory)?.label || announceCategory}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-space font-bold uppercase ${
                    announcePriority === "URGENT"
                      ? "bg-red-600 text-white"
                      : announcePriority === "PENTING"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Prioritas: {announcePriority}
                </span>
              </div>

              <h1 className="text-2xl font-bold font-bebas text-deep-charcoal tracking-wide">
                {announceTitle || "Judul Pengumuman"}
              </h1>

              {announcePreviewUrl && (
                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-black border border-[#D8D8D4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={announcePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {announceSummary && (
                <div className="p-3 bg-[#EDECE8]/60 border-l-4 border-l-[#FF9857] text-xs text-deep-charcoal">
                  {announceSummary}
                </div>
              )}

              <div className="text-xs text-deep-charcoal leading-relaxed whitespace-pre-wrap font-sans">
                {announceContent || "Isi konten pengumuman..."}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAnnouncePreviewModal(false)}
                className="px-4 py-2 border border-[#D9D7CF] text-xs font-semibold rounded-xs text-deep-charcoal cursor-pointer"
              >
                Tutup Pratinjau
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAnnouncePreviewModal(false);
                  saveAnnouncementDirect("PUBLISHED");
                }}
                className="px-5 py-2 bg-[#FF9857] hover:bg-[#2D2D2D] text-[#2D2D2D] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                Terbitkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
