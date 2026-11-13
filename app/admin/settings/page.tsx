"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Smartphone, AlertTriangle, Save, RefreshCw, LogOut } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    try {
      const [resSettings, resDevices] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/devices"),
      ]);
      const dataS = await resSettings.json();
      const dataD = await resDevices.json();
      setSettings(dataS.settings || {});
      setDevices(dataD.devices || []);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan.");
      setMsg("Pengaturan studio berhasil diperbarui!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeviceStatus = async (deviceId: string, isApproved: boolean) => {
    try {
      await fetch("/api/admin/devices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, isApproved }),
      });
      fetchData();
    } catch {}
  };

  const handleEmergencyLogout = async () => {
    if (!confirm("PERINGATAN KEAMANAN: Apakah Anda yakin ingin memutus paksa seluruh sesi login di perangkat lain? Anda akan tetap login di perangkat ini.")) return;
    try {
      const res = await fetch("/api/admin/devices", { method: "DELETE" });
      const data = await res.json();
      alert(data.message || "Seluruh sesi di perangkat lain telah di-logout!");
      fetchData();
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl font-display font-bold text-deep-charcoal">
          Pengaturan Studio & Arsitektur Keamanan
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Kelola metadata studio, nomor WhatsApp admin, perangkat terpercaya (Trusted Devices), dan audit keamanan.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xs">
          {msg}
        </div>
      )}

      {/* General Settings Form */}
      <form onSubmit={handleSaveSettings} className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-2">
          <Settings className="w-4 h-4 text-muted-olive" />
          <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
            Konfigurasi Brand & Kontak Studio
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Nama Studio Brand</label>
            <input
              type="text"
              value={settings["site_name"] || "Arvanta Studio"}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Nomor WhatsApp Admin Utama</label>
            <input
              type="text"
              value={settings["admin_whatsapp"] || "62895322465836"}
              onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email Resmi Studio</label>
            <input
              type="email"
              value={settings["admin_email"] || "rafifazmi466@gmail.com"}
              onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Keterangan Estimasi Domain & Hosting</label>
            <input
              type="text"
              value={settings["domain_hosting_estimate_text"] || "Rp 500.000 – Rp 700.000 / tahun"}
              onChange={(e) => setSettings({ ...settings, domain_hosting_estimate_text: e.target.value })}
              className="w-full px-3 py-2 bg-warm-ivory border border-[#D9D7CF] rounded-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Headline Utama Homepage</label>
          <input
            type="text"
            value={settings["hero_headline"] || "Building Digital Experiences That Move Businesses Forward."}
            onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs font-display font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Subheadline Homepage</label>
          <textarea
            rows={2}
            value={settings["hero_subheadline"] || "From websites to visual identities, we help businesses create a stronger and more meaningful digital presence."}
            onChange={(e) => setSettings({ ...settings, hero_subheadline: e.target.value })}
            className="w-full p-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
        </button>
      </form>

      {/* Trusted Devices Security Section */}
      <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
              Perangkat Terpercaya Admin (Trusted Devices)
            </h3>
          </div>
          <button
            onClick={handleEmergencyLogout}
            className="px-3 py-1 bg-red-700 text-white text-[11px] font-mono uppercase tracking-wider rounded-xs hover:bg-red-800 transition-colors flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Emergency Logout Semua Perangkat Lain</span>
          </button>
        </div>

        <p className="text-xs text-deep-charcoal/70 leading-relaxed">
          Sistem mencatat identitas unik setiap perangkat yang digunakan untuk masuk ke panel admin. Anda dapat menolak atau mencabut akses perangkat mencurigakan kapan saja.
        </p>

        <div className="divide-y divide-[#D9D7CF]/60 text-xs font-mono">
          {devices.map((d) => (
            <div key={d.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-olive shrink-0" />
                <div>
                  <span className="font-bold text-deep-charcoal block">{d.deviceName}</span>
                  <span className="text-[10px] text-deep-charcoal/60">
                    IP: {d.ipAddress || "Localhost"} • Terakhir aktif: {new Date(d.lastUsedAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    d.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {d.isApproved ? "DISETUJUI" : "DITOLAK"}
                </span>

                <button
                  type="button"
                  onClick={() => handleDeviceStatus(d.id, !d.isApproved)}
                  className="px-2.5 py-1 border border-[#D9D7CF] rounded-xs hover:bg-warm-ivory text-[10px]"
                >
                  {d.isApproved ? "Cabut Akses" : "Setujui"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
