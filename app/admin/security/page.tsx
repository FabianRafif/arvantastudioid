"use client";

import { useState, useEffect } from "react";
import { Lock, Shield, Smartphone, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSecurityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/security")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", text: "Kata sandi baru minimal 6 karakter." });
      return;
    }

    setUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengubah kata sandi.");

      setFeedback({ type: "success", text: json.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
          Pusat Keamanan & Sesi Admin
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Manajemen kredensial terenkripsi, sesi aktif akun, dan perangkat terpercaya.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password Form */}
        <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
            <KeyRound className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Perbarui Kata Sandi Akun
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 cursor-pointer"
            >
              {updating ? "Memproses..." : "Simpan Kata Sandi Baru"}
            </button>
          </form>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
            <Smartphone className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Daftar Sesi Aktif Terverifikasi
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-deep-charcoal/60">
              Memuat sesi...
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-deep-charcoal font-mono">Sesi Browser Saat Ini</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-xs">
                    Aktif
                  </span>
                </div>
                <span className="text-[11px] text-deep-charcoal/60 block font-mono">
                  Enkripsi: JWT + HttpOnly Session Cookie (7 Hari)
                </span>
              </div>

              <div className="p-3 bg-white border border-[#D9D7CF] rounded-xs text-xs space-y-1 font-mono text-[11px] text-deep-charcoal/70">
                <span className="font-bold block text-deep-charcoal font-sans">
                  Standar Keamanan Defense-in-Depth
                </span>
                <div>• Hashing Password: Bcrypt (Salt rounds: 12)</div>
                <div>• Proteksi Rate Limiting & Audit Trail Log</div>
                <div>• Isolasi Otorisasi Role-Based Access Control</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
