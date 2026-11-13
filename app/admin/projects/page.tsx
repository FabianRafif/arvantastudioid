"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Kanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  Save,
  Shield,
  Layers,
} from "lucide-react";

interface Project {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessName: string | null;
  deadline: string | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: string;
  items: { name: string }[];
  statusHistory: { newStatus: string; createdAt: string; notes: string | null }[];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit fields
  const [status, setStatus] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal memuat daftar proyek." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openDrawer = (proj: Project) => {
    setSelectedProject(proj);
    setStatus(proj.status);
    setInternalNotes(proj.internalNotes || "");
    setClientNotes(proj.notes || "");
  };

  const handleUpdate = async () => {
    if (!selectedProject) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedProject.id,
          status,
          internalNotes,
          clientNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengupdate proyek.");

      setFeedback({ type: "success", text: data.message });
      setSelectedProject(null);
      fetchProjects();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    "MENUNGGU_KONFIRMASI",
    "MENUNGGU_PEMBAYARAN",
    "PEMBAYARAN_DIVERIFIKASI",
    "IN_PROGRESS",
    "DESIGN_PROCESS",
    "DEVELOPMENT_PROCESS",
    "TESTING_STAGE",
    "REVISION",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Manajemen & Tracking Proyek
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola tahapan pengerjaan teknis, catatan internal rahasia staf, dan rincian deadline klien.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xs text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60 bg-white border border-[#D9D7CF] rounded-xs">
          Memuat data proyek aktif...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center text-xs text-deep-charcoal/60 bg-white border border-[#D9D7CF] rounded-xs space-y-2">
          <p>Belum ada proyek yang sedang berjalan.</p>
          <Link href="/order" className="text-muted-olive font-bold underline">
            Buat pesanan pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-2xs hover:border-deep-charcoal transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-xs bg-[#F5F2EB] px-2.5 py-1 rounded-xs border border-[#D9D7CF]">
                    {proj.orderNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs ${
                      proj.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : proj.status.includes("PROCESS") || proj.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {proj.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-deep-charcoal">
                    {proj.businessName || proj.customerName}
                  </h3>
                  <span className="text-xs text-muted-olive font-medium block">
                    {proj.items?.[0]?.name || "Proyek Website"}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#D9D7CF]/50 space-y-1.5 text-xs text-deep-charcoal/70">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-olive shrink-0" />
                    <span>{proj.customerName} ({proj.customerPhone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-olive shrink-0" />
                    <span className="font-mono text-[11px]">
                      Dibuat: {new Date(proj.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                {proj.internalNotes && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xs text-[11px] text-amber-900 leading-relaxed font-mono">
                    <span className="font-bold block mb-0.5">Catatan Internal Staf:</span>
                    <span className="line-clamp-2">{proj.internalNotes}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#D9D7CF]/60 mt-6 flex gap-2">
                <button
                  onClick={() => openDrawer(proj)}
                  className="flex-1 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors cursor-pointer text-center"
                >
                  Update Progres
                </button>
                <Link
                  href={`/admin/orders/${proj.id}`}
                  className="p-2 border border-[#D9D7CF] text-deep-charcoal hover:bg-[#F5F2EB] rounded-xs"
                  title="Lihat Rincian Order Lengkap"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Update Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#D9D7CF] pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-deep-charcoal">
                  Update Tahapan Proyek
                </h3>
                <span className="text-xs font-mono text-muted-olive font-semibold">
                  {selectedProject.orderNumber} • {selectedProject.customerName}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-deep-charcoal/50 hover:text-deep-charcoal font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Status Milestones Pengerjaan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono font-bold"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span>Catatan Internal Rahasia (Hanya Staf & Admin)</span>
                </label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Catatan pengerjaan backend, link repository private, pembagian tugas..."
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-xs font-mono text-[11px]"
                />
                <span className="text-[10px] text-deep-charcoal/50">
                  Pelanggan TIDAK BISA melihat catatan ini di dashboard mereka.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Catatan Progres untuk Klien
                </label>
                <textarea
                  rows={3}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Informasi yang dapat dibaca pelanggan di dashboard..."
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#D9D7CF] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 border border-[#D9D7CF] text-deep-charcoal font-semibold rounded-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-5 py-2 bg-deep-charcoal text-warm-ivory font-semibold rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
