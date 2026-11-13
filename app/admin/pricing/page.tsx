"use client";

import { useState, useEffect } from "react";
import { broadcastLiveUpdate } from "@/lib/live-sync";
import {
  DollarSign,
  TrendingUp,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  deliveryDays: number;
  revisions: number;
  isPopular: boolean;
  isActive: boolean;
  service: { id: string; name: string; slug: string };
}

interface PriceLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user?: { fullName: string; username: string };
}

export default function AdminPricingPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [logs, setLogs] = useState<PriceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit State Map
  const [editPrices, setEditPrices] = useState<{ [pkgId: string]: number }>({});
  const [editDelivery, setEditDelivery] = useState<{ [pkgId: string]: number }>({});
  const [editRevisions, setEditRevisions] = useState<{ [pkgId: string]: number }>({});
  const [editPopular, setEditPopular] = useState<{ [pkgId: string]: boolean }>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (res.ok) {
        setPackages(data.packages || []);
        setLogs(data.logs || []);

        const initialPrices: any = {};
        const initialDelivery: any = {};
        const initialRevisions: any = {};
        const initialPopular: any = {};

        data.packages?.forEach((p: PackageItem) => {
          initialPrices[p.id] = p.price;
          initialDelivery[p.id] = p.deliveryDays;
          initialRevisions[p.id] = p.revisions;
          initialPopular[p.id] = p.isPopular;
        });

        setEditPrices(initialPrices);
        setEditDelivery(initialDelivery);
        setEditRevisions(initialRevisions);
        setEditPopular(initialPopular);
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal memuat data harga." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (pkg: PackageItem) => {
    setSavingId(pkg.id);
    setFeedback(null);

    const newPrice = editPrices[pkg.id];
    const newDelivery = editDelivery[pkg.id];
    const newRevs = editRevisions[pkg.id];
    const isPop = editPopular[pkg.id];

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          newPrice,
          newDeliveryDays: newDelivery,
          newRevisions: newRevs,
          isPopular: isPop,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui harga.");
      }

      setFeedback({ type: "success", text: data.message });
      broadcastLiveUpdate();
      fetchData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Manajemen Harga Dinamis
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Ubah harga paket langsung di basis data. Seluruh website user dan kalkulator checkout otomatis terupdate.
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

      {/* Dynamic Price Editor Table */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9D7CF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Daftar Paket Layanan Aktif
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-olive font-semibold">
            {packages.length} Paket Terdaftar
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
            Memuat daftar harga paket...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] border-b border-[#D9D7CF] text-[10px] font-mono uppercase text-deep-charcoal/60">
                <tr>
                  <th className="p-4">Layanan & Paket</th>
                  <th className="p-4">Harga Terpasang (Rp)</th>
                  <th className="p-4">Estimasi Hari</th>
                  <th className="p-4">Revisi</th>
                  <th className="p-4">Status & Badge</th>
                  <th className="p-4 text-right">Aksi Simpan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60">
                {packages.map((pkg) => {
                  const isModified =
                    editPrices[pkg.id] !== pkg.price ||
                    editDelivery[pkg.id] !== pkg.deliveryDays ||
                    editRevisions[pkg.id] !== pkg.revisions ||
                    editPopular[pkg.id] !== pkg.isPopular;

                  return (
                    <tr
                      key={pkg.id}
                      className={`hover:bg-[#FAF9F5] transition-colors ${
                        isModified ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="p-4">
                        <span className="text-[10px] font-mono uppercase text-muted-olive block font-semibold">
                          {pkg.service.name}
                        </span>
                        <span className="text-sm font-bold text-deep-charcoal block">
                          {pkg.name}
                        </span>
                        <span className="text-[11px] text-deep-charcoal/60 line-clamp-1">
                          {pkg.description}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-deep-charcoal/50 font-mono">Rp</span>
                          <input
                            type="number"
                            step="50000"
                            value={editPrices[pkg.id] ?? pkg.price}
                            onChange={(e) =>
                              setEditPrices({
                                ...editPrices,
                                [pkg.id]: Number(e.target.value),
                              })
                            }
                            className="w-36 px-2.5 py-1.5 text-xs font-mono font-bold bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                          />
                        </div>
                        {editPrices[pkg.id] !== pkg.price && (
                          <span className="text-[10px] text-amber-700 font-mono block mt-1">
                            Awal: Rp{pkg.price.toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={editDelivery[pkg.id] ?? pkg.deliveryDays}
                            onChange={(e) =>
                              setEditDelivery({
                                ...editDelivery,
                                [pkg.id]: Number(e.target.value),
                              })
                            }
                            className="w-16 px-2 py-1.5 text-xs font-mono bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs text-center"
                          />
                          <span className="text-[11px] text-deep-charcoal/60">Hari</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={editRevisions[pkg.id] ?? pkg.revisions}
                            onChange={(e) =>
                              setEditRevisions({
                                ...editRevisions,
                                [pkg.id]: Number(e.target.value),
                              })
                            }
                            className="w-14 px-2 py-1.5 text-xs font-mono bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs text-center"
                          />
                          <span className="text-[11px] text-deep-charcoal/60">x</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={editPopular[pkg.id] ?? pkg.isPopular}
                            onChange={(e) =>
                              setEditPopular({
                                ...editPopular,
                                [pkg.id]: e.target.checked,
                              })
                            }
                            className="rounded-xs text-muted-olive focus:ring-0"
                          />
                          <span className="font-mono text-[11px]">Badge Populer</span>
                        </label>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSave(pkg)}
                          disabled={savingId === pkg.id || !isModified}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                            isModified
                              ? "bg-deep-charcoal text-warm-ivory hover:bg-muted-olive shadow-xs"
                              : "bg-[#EAE5DB] text-deep-charcoal/40 cursor-not-allowed"
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === pkg.id ? "Menyimpan..." : "Simpan"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log of Price History */}
      <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
          <History className="w-4 h-4 text-muted-olive" />
          <h3 className="text-sm font-bold text-deep-charcoal">
            Riwayat Perubahan Harga (Audit Trail)
          </h3>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-deep-charcoal/60 font-mono py-2">
            Belum ada catatan perubahan harga pada sistem.
          </p>
        ) : (
          <div className="divide-y divide-[#D9D7CF]/60 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-deep-charcoal">{log.details}</span>
                  <span className="text-[11px] text-deep-charcoal/50 block font-mono">
                    Oleh: {log.user?.fullName || "Administrator"} ({log.user?.username || "admin"})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-olive shrink-0">
                  {new Date(log.createdAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
