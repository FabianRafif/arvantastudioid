"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Check, Code2, AlertCircle, Palette } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priceFrom, setPriceFrom] = useState(500000);
  const [priceTo, setPriceTo] = useState(3000000);
  const [domainHostingNote, setDomainHostingNote] = useState("Estimasi domain & cloud hosting Rp 500.000 – Rp 700.000 per tahun (terpisah).");
  const [features, setFeatures] = useState("");
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [revisionCount, setRevisionCount] = useState(3);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      setServices(data.services || []);
      if (data.services?.[0]?.categoryId) {
        setCategoryId(data.services[0].categoryId);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const payload: any = {
        name,
        slug,
        categoryId: categoryId || services[0]?.categoryId,
        description,
        priceFrom,
        priceTo,
        domainHostingNote,
        features,
        deliveryDays,
        revisionCount,
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan layanan.");

      setShowModal(false);
      setEditingId(null);
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setName(s.name);
    setSlug(s.slug);
    setCategoryId(s.categoryId);
    setDescription(s.description);
    setPriceFrom(s.priceFrom);
    setPriceTo(s.priceTo);
    setDomainHostingNote(s.domainHostingNote || "");
    setFeatures(s.features);
    setDeliveryDays(s.deliveryDays);
    setRevisionCount(s.revisionCount);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;
    try {
      await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      fetchServices();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Top Section Switcher */}
      <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs">
          <Code2 className="w-3.5 h-3.5 text-[#FF9857]" />
          <span>Layanan Website &amp; Sistem</span>
        </span>
        <Link
          href="/admin/design"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-warm-ivory border border-[#D9D7CF] text-deep-charcoal text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
        >
          <Palette className="w-3.5 h-3.5 text-[#FF9857]" />
          <span>Katalog Desain Grafis</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-deep-charcoal">
            Manajemen Layanan & Paket Website
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Atur paket, harga fleksibel (Rp500.000 – Rp3.000.000), estimasi domain & hosting, dan fitur layanan.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setName("");
            setSlug("");
            setDescription("");
            setPriceFrom(500000);
            setPriceTo(2500000);
            setFeatures("Responsive Mobile\nDesain Editorial Kustom\nSEO On-Page\nIntegrasi WhatsApp");
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </button>
      </div>

      {/* Services List Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-ivory border-b border-[#D9D7CF] font-mono text-[11px] text-deep-charcoal/70 uppercase">
                <th className="py-3 px-6">Nama Layanan</th>
                <th className="py-3 px-6">Rentang Harga</th>
                <th className="py-3 px-6">Domain & Hosting Terpisah</th>
                <th className="py-3 px-6">Waktu & Revisi</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D7CF]/60">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-warm-ivory/50">
                  <td className="py-4 px-6">
                    <span className="font-bold text-deep-charcoal block">{s.name}</span>
                    <span className="text-[10px] text-deep-charcoal/60 font-mono">/{s.slug}</span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-deep-charcoal">
                    Rp{s.priceFrom.toLocaleString("id-ID")} – Rp{s.priceTo.toLocaleString("id-ID")}
                  </td>
                  <td className="py-4 px-6 text-[11px] text-deep-charcoal/70 max-w-xs">
                    {s.domainHostingNote || "Rp 500.000 – Rp 700.000 / tahun"}
                  </td>
                  <td className="py-4 px-6 font-mono text-deep-charcoal/70">
                    {s.deliveryDays} hari • {s.revisionCount}x revisi
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-1.5 text-deep-charcoal hover:bg-warm-ivory rounded-xs"
                        title="Edit Layanan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs"
                        title="Hapus Layanan"
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

      {/* Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D7CF] rounded-xs max-w-xl w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-display font-bold text-deep-charcoal uppercase border-b border-[#D9D7CF] pb-2">
              {editingId ? "Edit Layanan Website" : "Tambah Layanan Website Baru"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Layanan</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                      }
                    }}
                    placeholder="Contoh: Landing Page Startup"
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="landing-page-startup"
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Harga Mulai (Rp)</label>
                  <input
                    type="number"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Harga Maksimal (Rp)</label>
                  <input
                    type="number"
                    value={priceTo}
                    onChange={(e) => setPriceTo(parseInt(e.target.value || "0", 10))}
                    className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Layanan</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Keterangan Domain & Hosting Terpisah</label>
                <input
                  type="text"
                  value={domainHostingNote}
                  onChange={(e) => setDomainHostingNote(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Fitur yang Didapatkan (Satu baris per fitur)</label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full p-2.5 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono text-[11px]"
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
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
