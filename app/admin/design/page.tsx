"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Palette } from "lucide-react";

export default function AdminDesignCatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priceStarting, setPriceStarting] = useState(50000);
  const [deliveryDays, setDeliveryDays] = useState(2);
  const [revisions, setRevisions] = useState(3);
  const [fileFormats, setFileFormats] = useState("AI, EPS, PNG, JPG, PDF");
  const [isFeatured, setIsFeatured] = useState(true);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/admin/design");
      const data = await res.json();
      setItems(data.items || []);
      setCategories(data.categories || []);
      if (data.categories?.[0]) setCategoryId(data.categories[0].id);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const payload: any = {
        name,
        slug,
        categoryId: categoryId || categories[0]?.id,
        description,
        priceStarting,
        deliveryDays,
        revisions,
        fileFormats,
        isFeatured,
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/design", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan katalog desain.");

      setShowModal(false);
      setEditingId(null);
      fetchCatalog();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setCategoryId(item.categoryId);
    setDescription(item.description);
    setPriceStarting(item.priceStarting);
    setDeliveryDays(item.deliveryDays);
    setRevisions(item.revisions);
    setFileFormats(item.fileFormats);
    setIsFeatured(item.isFeatured);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk desain ini dari katalog?")) return;
    try {
      await fetch(`/api/admin/design?id=${id}`, { method: "DELETE" });
      fetchCatalog();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-deep-charcoal">
            Katalog Layanan Desain Grafis
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola 15+ kategori produk desain grafis mulai dari Rp50.000 dengan format file master siap cetak.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setName("");
            setSlug("");
            setDescription("");
            setPriceStarting(50000);
            setDeliveryDays(2);
            setRevisions(3);
            setFileFormats("AI, EPS, PNG, JPG, PDF");
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Desain Baru</span>
        </button>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                <th className="py-3 px-6">Nama Desain</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6">Harga Mulai</th>
                <th className="py-3 px-6">Format File</th>
                <th className="py-3 px-6">Waktu & Revisi</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D7CF]/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-warm-ivory/50">
                  <td className="py-4 px-6 font-bold text-deep-charcoal">
                    {item.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-muted-olive font-bold">
                    {item.category?.name || "General"}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                    Rp{item.priceStarting.toLocaleString("id-ID")}
                  </td>
                  <td className="py-4 px-6 font-mono text-deep-charcoal/70">
                    {item.fileFormats}
                  </td>
                  <td className="py-4 px-6 font-mono text-deep-charcoal/70">
                    {item.deliveryDays} hari • {item.revisions}x revisi
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-deep-charcoal hover:bg-warm-ivory rounded-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs"
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
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D7CF] rounded-xs max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2">
              {editingId ? "Edit Produk Desain" : "Tambah Produk Desain Baru"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Produk Desain</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }}
                    placeholder="Contoh: Logo Design UMKM"
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Harga Mulai (Rp)</label>
                  <input
                    type="number"
                    value={priceStarting}
                    onChange={(e) => setPriceStarting(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Format File yang Didapat</label>
                  <input
                    type="text"
                    value={fileFormats}
                    onChange={(e) => setFileFormats(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D7CF]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D9D7CF] rounded-xs hover:bg-warm-ivory"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-deep-charcoal text-warm-ivory font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
