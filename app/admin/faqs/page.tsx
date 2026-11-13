"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Plus, Trash2, Edit2, Save, CheckCircle2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [sortOrder, setSortOrder] = useState(0);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (res.ok) setFaqs(data.faqs || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category, sortOrder }),
      });
      if (res.ok) {
        setShowModal(false);
        setQuestion("");
        setAnswer("");
        fetchFaqs();
      }
    } catch {}
  };

  const toggleActive = async (faq: FAQ) => {
    try {
      await fetch("/api/admin/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faq.id, isActive: !faq.isActive }),
      });
      fetchFaqs();
    } catch {}
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    try {
      await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
      fetchFaqs();
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Manajemen FAQ & Pusat Bantuan
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola daftar pertanyaan dan jawaban resmi yang ditampilkan di website publik.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pertanyaan</span>
        </button>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9D7CF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Daftar Tanya Jawab Terdaftar
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-olive font-semibold">
            {faqs.length} FAQ
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
            Memuat FAQ...
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center text-xs text-deep-charcoal/60">
            Belum ada FAQ. Tambahkan pertanyaan pertama.
          </div>
        ) : (
          <div className="divide-y divide-[#D9D7CF]/60 text-xs">
            {faqs.map((f) => (
              <div key={f.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#FAF9F5]">
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] font-mono uppercase bg-muted-olive/15 text-muted-olive px-2 py-0.5 rounded-xs font-semibold">
                    {f.category}
                  </span>
                  <h3 className="font-bold text-sm text-deep-charcoal">{f.question}</h3>
                  <p className="text-xs text-deep-charcoal/70 leading-relaxed max-w-3xl">{f.answer}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(f)}
                    className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                      f.isActive
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {f.isActive ? "Publik" : "Draft"}
                  </button>

                  <button
                    onClick={() => deleteFaq(f.id)}
                    className="p-1.5 text-deep-charcoal/40 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#D9D7CF] pb-4">
              <h3 className="text-lg font-display font-bold text-deep-charcoal">
                Tambah FAQ Baru
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-deep-charcoal/50 hover:text-deep-charcoal font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Pertanyaan
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Contoh: Berapa lama pembuatan website?"
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Jawaban Lengkap
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban yang ramah dan profesional..."
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                  >
                    <option value="GENERAL">Umum</option>
                    <option value="PENGERJAAN">Pengerjaan</option>
                    <option value="PEMBAYARAN">Pembayaran</option>
                    <option value="BIAYA">Biaya & Paket</option>
                    <option value="TEKNIS">Teknis & Hosting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>
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
                  className="px-5 py-2 bg-deep-charcoal text-warm-ivory font-semibold rounded-xs hover:bg-muted-olive transition-colors cursor-pointer"
                >
                  Simpan FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
