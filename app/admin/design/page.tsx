"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { broadcastLiveUpdate } from "@/lib/live-sync";
import {
  Plus,
  Edit2,
  Trash2,
  Palette,
  Code2,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  Sparkles,
  Layers,
  ArrowUpRight,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function AdminDesignCatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priceStarting, setPriceStarting] = useState(50000);
  const [deliveryDays, setDeliveryDays] = useState(2);
  const [revisions, setRevisions] = useState(3);
  const [fileFormats, setFileFormats] = useState("AI, EPS, SVG, PNG, JPG, PDF");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/design");
      const data = await res.json();
      setItems(data.items || []);
      setCategories(data.categories || []);
      if (data.categories?.[0] && !categoryId) {
        setCategoryId(data.categories[0].id);
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal memuat katalog desain dari server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setPriceStarting(50000);
    setDeliveryDays(2);
    setRevisions(3);
    setFileFormats("AI, EPS, SVG, PNG, JPG, PDF");
    setIsFeatured(false);
    setIsActive(true);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name || "");
    setSlug(item.slug || "");
    setCategoryId(item.categoryId || categories[0]?.id || "");
    setDescription(item.description || "");
    setPriceStarting(item.priceStarting || 50000);
    setDeliveryDays(item.deliveryDays || 2);
    setRevisions(item.revisions || 3);
    setFileFormats(item.fileFormats || "AI, EPS, SVG, PNG, JPG, PDF");
    setIsFeatured(Boolean(item.isFeatured));
    setIsActive(item.isActive !== false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const payload: any = {
        name,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
        categoryId: categoryId || categories[0]?.id,
        description,
        priceStarting: Number(priceStarting),
        deliveryDays: Number(deliveryDays),
        revisions: Number(revisions),
        fileFormats,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/design", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk desain.");

      setFeedback({
        type: "success",
        text: editingId
          ? `Produk desain "${name}" berhasil diperbarui!`
          : `Produk desain baru "${name}" berhasil ditambahkan ke katalog!`,
      });

      broadcastLiveUpdate();
      setTimeout(() => setFeedback(null), 4000);
      setShowModal(false);
      setEditingId(null);
      fetchCatalog();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Hapus produk desain "${item.name}" dari katalog?`)) return;
    try {
      const res = await fetch(`/api/admin/design?id=${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus.");

      setFeedback({
        type: "success",
        text: `Produk "${item.name}" berhasil dihapus.`,
      });
      broadcastLiveUpdate();
      setTimeout(() => setFeedback(null), 4000);
      fetchCatalog();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      const nextStatus = !item.isActive;
      const res = await fetch("/api/admin/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isActive: nextStatus,
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, isActive: nextStatus } : it))
        );
        broadcastLiveUpdate();
        setFeedback({
          type: "success",
          text: `Status produk "${item.name}" diubah menjadi ${
            nextStatus ? "Aktif" : "Nonaktif"
          }.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal mengubah status produk." });
    }
  };

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchCat =
        selectedCategoryFilter === "all" || it.categoryId === selectedCategoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.fileFormats?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Section Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-warm-ivory border border-[#D9D7CF] text-deep-charcoal text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-[#FF9857]" />
          <span>Layanan Website &amp; Sistem</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs shadow-xs">
          <Palette className="w-3.5 h-3.5 text-[#FF9857]" />
          <span>Katalog Desain Grafis ({items.length})</span>
        </span>
      </div>

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-deep-charcoal">
              Katalog Layanan Desain Grafis &amp; Brand Identity
            </h1>
            <span className="px-2.5 py-0.5 bg-[#FF9857] text-deep-charcoal font-mono font-bold text-xs rounded-full">
              {items.length} Produk
            </span>
          </div>
          <p className="text-xs text-deep-charcoal/60 font-mono mt-1">
            Kelola daftar produk desain grafis, harga awal, spesifikasi format file master, dan status tayang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/services?tab=design#design-catalog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#D9D7CF] hover:bg-white text-deep-charcoal text-xs font-mono font-semibold rounded-xs transition-colors"
          >
            <span>Lihat di Website</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal hover:bg-[#FF9857] text-warm-ivory hover:text-deep-charcoal text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Desain Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xs flex items-center justify-between gap-3 text-xs font-mono ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : "bg-red-50 text-red-800 border border-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xs border border-[#D9D7CF]">
          <span className="text-[10px] font-mono text-deep-charcoal/60 uppercase block mb-1">
            Total Produk Desain
          </span>
          <div className="text-xl font-display font-bold text-deep-charcoal">
            {items.length} Layanan
          </div>
        </div>
        <div className="bg-white p-4 rounded-xs border border-[#D9D7CF]">
          <span className="text-[10px] font-mono text-deep-charcoal/60 uppercase block mb-1">
            Produk Aktif Tayang
          </span>
          <div className="text-xl font-display font-bold text-emerald-700">
            {items.filter((i) => i.isActive).length} Produk
          </div>
        </div>
        <div className="bg-white p-4 rounded-xs border border-[#D9D7CF]">
          <span className="text-[10px] font-mono text-deep-charcoal/60 uppercase block mb-1">
            Produk Unggulan
          </span>
          <div className="text-xl font-display font-bold text-[#FF9857]">
            {items.filter((i) => i.isFeatured).length} Pilihan
          </div>
        </div>
        <div className="bg-white p-4 rounded-xs border border-[#D9D7CF]">
          <span className="text-[10px] font-mono text-deep-charcoal/60 uppercase block mb-1">
            Total Kategori
          </span>
          <div className="text-xl font-display font-bold text-deep-charcoal">
            {categories.length} Kategori
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xs border border-[#D9D7CF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama desain, format file..."
            className="w-full pl-9 pr-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs font-mono text-xs outline-none focus:border-deep-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-mono text-[11px] text-deep-charcoal/60 shrink-0">
            Filter Kategori:
          </span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs font-mono text-xs outline-none focus:border-deep-charcoal w-full sm:w-auto"
          >
            <option value="all">Semua Kategori ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
            Memuat data katalog desain...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60 space-y-2">
            <p>Tidak ada produk desain yang cocok dengan filter atau pencarian Anda.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryFilter("all");
              }}
              className="text-[#FF9857] underline font-bold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                  <th className="py-3 px-5">Nama Desain</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5">Harga Mulai</th>
                  <th className="py-3 px-5">Format File</th>
                  <th className="py-3 px-5">Pengerjaan</th>
                  <th className="py-3 px-4 text-center">Unggulan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60 font-sans">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-warm-ivory/40 transition-colors ${
                      !item.isActive ? "opacity-60 bg-neutral-50" : ""
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-deep-charcoal">{item.name}</div>
                      <div className="text-[10px] font-mono text-deep-charcoal/50">
                        slug: /{item.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-muted-olive font-bold">
                      {item.category?.name || "General"}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-deep-charcoal">
                      Rp{item.priceStarting.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-deep-charcoal/70 max-w-[160px] truncate" title={item.fileFormats}>
                      {item.fileFormats}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-deep-charcoal/70 text-[11px]">
                      ~{item.deliveryDays} hari • {item.revisions}x revisi
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-mono font-semibold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Ya</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-deep-charcoal/40">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200"
                        }`}
                        title="Klik untuk mengubah status aktif/nonaktif"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isActive ? "bg-emerald-600" : "bg-neutral-400"
                          }`}
                        />
                        <span>{item.isActive ? "Aktif" : "Nonaktif"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-deep-charcoal hover:bg-warm-ivory border border-transparent hover:border-[#D9D7CF] rounded-xs transition-colors cursor-pointer"
                          title="Edit Produk Desain"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xs transition-colors cursor-pointer"
                          title="Hapus Produk Desain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Desain */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D9D7CF] rounded-xs max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#FF9857]" />
                <h3 className="text-base font-display font-bold text-deep-charcoal uppercase">
                  {editingId ? "Edit Produk Desain" : "Tambah Produk Desain Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-deep-charcoal/50 hover:text-deep-charcoal text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Produk Desain *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]/g, "-")
                        );
                      }
                    }}
                    placeholder="Contoh: Logo Vector UMKM"
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs outline-none focus:border-deep-charcoal font-sans"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="contoh: logo-vector-umkm"
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs outline-none focus:border-deep-charcoal font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kategori Desain *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs outline-none focus:border-deep-charcoal font-mono"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Harga Mulai (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={priceStarting}
                    onChange={(e) => setPriceStarting(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs font-mono font-bold outline-none focus:border-deep-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold mb-1">Waktu Kerja (Hari)</label>
                  <input
                    type="number"
                    min={1}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(parseInt(e.target.value || "1", 10))}
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs font-mono outline-none focus:border-deep-charcoal"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-semibold mb-1">Jatah Revisi (Kali)</label>
                  <input
                    type="number"
                    min={0}
                    value={revisions}
                    onChange={(e) => setRevisions(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs font-mono outline-none focus:border-deep-charcoal"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-semibold mb-1">Format Master</label>
                  <input
                    type="text"
                    value={fileFormats}
                    onChange={(e) => setFileFormats(e.target.value)}
                    placeholder="AI, EPS, PNG, PDF"
                    className="w-full px-3 py-2 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs font-mono text-[11px] outline-none focus:border-deep-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Layanan &amp; Cakupan</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan apa yang didapatkan klien, spesifikasi teknis, atau ketentuan pengerjaan..."
                  className="w-full p-2.5 bg-warm-ivory/60 border border-[#D9D7CF] rounded-xs outline-none focus:border-deep-charcoal font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 pb-1 border-t border-[#D9D7CF]/60 font-mono text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-deep-charcoal"
                  />
                  <span>Tampilkan sebagai Produk Unggulan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className={isActive ? "text-emerald-700 font-bold" : "text-neutral-500"}>
                    Status Aktif (Tayang di Website)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D7CF]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D9D7CF] hover:bg-warm-ivory rounded-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-deep-charcoal hover:bg-[#FF9857] text-warm-ivory hover:text-deep-charcoal font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  {editingId ? "Simpan Perubahan" : "Tambahkan ke Katalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
