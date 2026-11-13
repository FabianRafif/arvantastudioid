"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, CheckCircle2, AlertCircle, Save } from "lucide-react";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/customer/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          setFullName(d.user.fullName || "");
          setPhone(d.user.phone || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          ...(newPassword && { currentPassword, newPassword }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil.");

      setFeedback({ type: "success", text: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
          Profil & Pengaturan Akun
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Kelola informasi nama, nomor WhatsApp aktif, dan keamanan akun Anda.
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

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
          Memuat profil...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-deep-charcoal border-b border-[#D9D7CF] pb-2">
              Informasi Pribadi & Kontak
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Nama Lengkap / Nama Bisnis
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Nomor WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Alamat Email (Permanen)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3 py-2 bg-[#EAE5DB] border border-[#D9D7CF] rounded-xs text-deep-charcoal/60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-deep-charcoal border-b border-[#D9D7CF] pb-2">
              Ganti Kata Sandi (Opsional)
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Hanya diisi jika ingin mengganti kata sandi"
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan Perubahan..." : "Simpan Perubahan Akun"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
