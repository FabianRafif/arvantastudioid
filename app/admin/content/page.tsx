"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings2,
  Activity,
} from "lucide-react";
import TechIcon from "@/components/TechIcons";
import { broadcastLiveUpdate } from "@/lib/live-sync";
import {
  RunningItem,
  RunningTextConfig,
  DEFAULT_RUNNING_TEXT_CONFIG,
} from "@/lib/running-text";

const ICON_OPTIONS = [
  { value: "canva", label: "Canva" },
  { value: "figma", label: "Figma" },
  { value: "nextjs", label: "Next.JS" },
  { value: "react", label: "React" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "nodejs", label: "Node.JS" },
  { value: "wordpress", label: "WordPress" },
  { value: "laravel", label: "Laravel" },
  { value: "php", label: "PHP" },
  { value: "python", label: "Python" },
  { value: "docker", label: "Docker" },
  { value: "mysql", label: "MySQL" },
  { value: "photoshop", label: "Adobe Photoshop" },
  { value: "illustrator", label: "Adobe Illustrator" },
  { value: "git", label: "Git / GitHub" },
  { value: "arvanta", label: "Arvanta Studio Symbol" },
  { value: "custom", label: "Custom URL" },
];

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Content Fields
  const [headline, setHeadline] = useState("Digital Solutions, Built with Purpose.");
  const [subheadline, setSubheadline] = useState(
    "Arvanta Studio membangun website eksklusif, sistem manajemen bisnis, dan ekosistem digital berkinerja tinggi untuk membawa usaha Anda melangkah ke tingkat berikutnya."
  );
  const [ctaPrimary, setCtaPrimary] = useState("Mulai Konsultasi & Order");
  const [aboutIntro, setAboutIntro] = useState(
    "Arvanta Studio merupakan penyedia jasa pembuatan website dan sistem digital untuk membantu bisnis, organisasi, institusi, dan UMKM berkembang melalui teknologi yang tepat guna."
  );
  const [aboutVision, setAboutVision] = useState(
    "Menjadi mitra transformasi digital nomor satu yang menghadirkan teknologi andal, berestetika tinggi, dan berdampak nyata bagi pertumbuhan bisnis."
  );

  // Running Text Marquee Fields
  const [runningConfig, setRunningConfig] = useState<RunningTextConfig>(
    DEFAULT_RUNNING_TEXT_CONFIG
  );

  useEffect(() => {
    // 1. Fetch CMS Text Settings
    const p1 = fetch("/api/admin/content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          if (data.settings.HERO_HEADLINE) setHeadline(data.settings.HERO_HEADLINE);
          if (data.settings.HERO_SUBHEADLINE) setSubheadline(data.settings.HERO_SUBHEADLINE);
          if (data.settings.HERO_CTA_PRIMARY) setCtaPrimary(data.settings.HERO_CTA_PRIMARY);
          if (data.settings.ABOUT_INTRO) setAboutIntro(data.settings.ABOUT_INTRO);
          if (data.settings.ABOUT_VISION) setAboutVision(data.settings.ABOUT_VISION);
        }
      });

    // 2. Fetch Running Text Config
    const p2 = fetch("/api/running-text")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.config) {
          setRunningConfig(data.config);
        }
      });

    Promise.all([p1, p2]).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // 1. Save CMS general text
      const resContent = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HERO_HEADLINE: headline,
          HERO_SUBHEADLINE: subheadline,
          HERO_CTA_PRIMARY: ctaPrimary,
          ABOUT_INTRO: aboutIntro,
          ABOUT_VISION: aboutVision,
        }),
      });

      if (!resContent.ok) {
        const d = await resContent.json();
        throw new Error(d.error || "Gagal menyimpan konten CMS.");
      }

      // 2. Save Running Text Config
      const resRunning = await fetch("/api/running-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runningConfig),
      });

      if (!resRunning.ok) {
        const d = await resRunning.json();
        throw new Error(d.error || "Gagal menyimpan running text.");
      }

      // 3. Trigger 0ms instant multi-tab broadcast!
      broadcastLiveUpdate();

      setFeedback({
        type: "success",
        text: "Konten website & Running Text berhasil disimpan dan disinkronkan secara real-time ke beranda!",
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Running Text Item Handlers
  const handleAddItem = () => {
    const newItem: RunningItem = {
      id: Date.now().toString(),
      icon: "canva",
      text: "Logo Baru | Baru",
      isActive: true,
    };
    setRunningConfig((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<RunningItem>) => {
    setRunningConfig((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setRunningConfig((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= runningConfig.items.length) return;

    const newItems = [...runningConfig.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setRunningConfig((prev) => ({ ...prev, items: newItems }));
  };

  return (
    <div className="space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            CMS Konten Website & Beranda
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola teks hero, penjelasan studio, serta Running Text Ticker berjalan secara real-time tanpa jeda.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Menyimpan..." : "Publikasikan Real-time"}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xs text-xs flex items-center gap-2 border transition-all ${
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================= */}
        {/* SECTION: RUNNING TEXT TICKER (LOGO & TEKS BERJALAN) */}
        {/* ========================================================= */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-xs p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF9857] text-[#2D2D2D] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-deep-charcoal">
                  Running Text Ticker (Logo & Teks Berjalan)
                </h2>
                <p className="text-xs text-[#787875]">
                  Menampilkan deretan tool & logo (misal: Canva, Figma, Next.JS) yang berjalan tanpa jeda di bawah Penawaran Awal Beranda.
                </p>
              </div>
            </div>

            {/* Toggle Status Aktif */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-deep-charcoal cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={runningConfig.enabled}
                  onChange={(e) =>
                    setRunningConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#FF9857] cursor-pointer"
                />
                <span>Status Aktif di Beranda</span>
              </label>
            </div>
          </div>

          {/* Controls: Tema, Kecepatan, Separator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F6F5F2] p-4 border border-[#D9D7CF] rounded-xs text-xs">
            {/* Tema Warna */}
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Gaya Tampilan (Tema)
              </label>
              <select
                value={runningConfig.theme}
                onChange={(e) =>
                  setRunningConfig((prev) => ({
                    ...prev,
                    theme: e.target.value as "light" | "dark" | "orange",
                  }))
                }
                className="w-full px-3 py-2 bg-white border border-[#D9D7CF] rounded-xs font-medium cursor-pointer"
              >
                <option value="light">Alabaster Light (Standar Beranda)</option>
                <option value="dark">Off-Black Charcoal (Kontras Gelap)</option>
                <option value="orange">Tangerine Orange (Aksen Cerah)</option>
              </select>
            </div>

            {/* Kecepatan Animasi */}
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Kecepatan Berjalan (Durasi Putaran)
              </label>
              <select
                value={runningConfig.speed}
                onChange={(e) =>
                  setRunningConfig((prev) => ({
                    ...prev,
                    speed: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 bg-white border border-[#D9D7CF] rounded-xs font-medium cursor-pointer"
              >
                <option value={18}>Cepat (18 Detik)</option>
                <option value={28}>Normal / Buttery Smooth (28 Detik)</option>
                <option value={40}>Santai (40 Detik)</option>
                <option value={55}>Lambat / Elegan (55 Detik)</option>
              </select>
            </div>

            {/* Simbol Pemisah */}
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Simbol Pemisah Antar Item
              </label>
              <input
                type="text"
                value={runningConfig.separator}
                onChange={(e) =>
                  setRunningConfig((prev) => ({
                    ...prev,
                    separator: e.target.value,
                  }))
                }
                placeholder="✦ atau // atau • atau |"
                className="w-full px-3 py-2 bg-white border border-[#D9D7CF] rounded-xs font-medium"
              />
            </div>
          </div>

          {/* Live Preview Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#787875]">
              <span className="font-semibold uppercase tracking-wider font-space flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FF9857]" />
                Live Preview (Tampilan Berjalan Tanpa Jeda)
              </span>
              <span>Looping otomatis 60 FPS</span>
            </div>

            <div
              className={`overflow-hidden border-y py-3 rounded-xs ${
                runningConfig.theme === "dark"
                  ? "bg-[#2D2D2D] text-[#EDECE8] border-[#3D3D3D]"
                  : runningConfig.theme === "orange"
                  ? "bg-[#FF9857] text-[#2D2D2D] border-[#E57E3D]"
                  : "bg-[#F6F5F2] text-[#2D2D2D] border-[#D8D8D4]"
              }`}
            >
              <div
                className="animate-marquee-infinite flex items-center select-none"
                style={
                  {
                    "--marquee-speed": `${runningConfig.speed || 28}s`,
                  } as React.CSSProperties
                }
              >
                {/* Track 1 */}
                <div className="flex items-center shrink-0">
                  {runningConfig.items
                    .filter((it) => it.isActive)
                    .map((it, idx) => (
                      <div key={`p1-${it.id}-${idx}`} className="inline-flex items-center gap-3 shrink-0">
                        <TechIcon name={it.icon} customIconUrl={it.customIconUrl} className="w-5 h-5" />
                        <span className="font-space font-semibold text-xs tracking-widest uppercase">
                          {it.text}
                        </span>
                        <span className="mx-4 text-xs font-bold text-[#FF9857]">
                          {runningConfig.separator || "✦"}
                        </span>
                      </div>
                    ))}
                </div>
                {/* Track 2 for seamless loop */}
                <div className="flex items-center shrink-0">
                  {runningConfig.items
                    .filter((it) => it.isActive)
                    .map((it, idx) => (
                      <div key={`p2-${it.id}-${idx}`} className="inline-flex items-center gap-3 shrink-0">
                        <TechIcon name={it.icon} customIconUrl={it.customIconUrl} className="w-5 h-5" />
                        <span className="font-space font-semibold text-xs tracking-widest uppercase">
                          {it.text}
                        </span>
                        <span className="mx-4 text-xs font-bold text-[#FF9857]">
                          {runningConfig.separator || "✦"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Item Running Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-deep-charcoal text-xs">
                Daftar Item Running Text ({runningConfig.items.length} Item Terdaftar)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold rounded-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Item Baru</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {runningConfig.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-xs flex flex-col md:flex-row items-stretch md:items-center gap-3 text-xs transition-all ${
                    item.isActive ? "bg-white border-[#D9D7CF]" : "bg-[#F5F2EB]/50 border-dashed border-[#D9D7CF] opacity-60"
                  }`}
                >
                  {/* Reorder and Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(index, "up")}
                      className="p-1 hover:bg-[#F5F2EB] rounded-xs disabled:opacity-30 cursor-pointer"
                      title="Geser ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === runningConfig.items.length - 1}
                      onClick={() => handleMoveItem(index, "down")}
                      className="p-1 hover:bg-[#F5F2EB] rounded-xs disabled:opacity-30 cursor-pointer"
                      title="Geser ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <label className="flex items-center gap-1.5 cursor-pointer ml-1">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => handleUpdateItem(item.id, { isActive: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#FF9857] cursor-pointer"
                      />
                      <span className="text-[11px] font-medium text-[#787875]">Aktif</span>
                    </label>
                  </div>

                  {/* Icon Selector & Preview */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-xs bg-[#F6F5F2] border border-[#D9D7CF] flex items-center justify-center shrink-0">
                      <TechIcon name={item.icon} customIconUrl={item.customIconUrl} className="w-4 h-4" />
                    </div>

                    <select
                      value={item.icon}
                      onChange={(e) => handleUpdateItem(item.id, { icon: e.target.value })}
                      className="px-2.5 py-1.5 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-medium cursor-pointer"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Text Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                      placeholder='Contoh: "Logo Canva | Canva"'
                      className="w-full px-3 py-1.5 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-space font-medium"
                    />
                  </div>

                  {/* Custom URL if icon is custom */}
                  {item.icon === "custom" && (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.customIconUrl || ""}
                        onChange={(e) => handleUpdateItem(item.id, { customIconUrl: e.target.value })}
                        placeholder="https://... atau /images/logo.png"
                        className="w-full px-3 py-1.5 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono text-[11px]"
                      />
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs shrink-0 self-end md:self-auto cursor-pointer"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#D9D7CF] flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan & Publikasikan Real-Time"}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Section 1: Hero Beranda Teks CMS */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
            <Globe className="w-4 h-4 text-muted-olive" />
            <h3 className="text-sm font-bold text-deep-charcoal">
              Hero Section (Beranda Utama)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Headline Utama (Besar)
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-display text-base font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Deskripsi Sub-Headline
              </label>
              <textarea
                rows={3}
                required
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Teks Tombol CTA Utama
              </label>
              <input
                type="text"
                required
                value={ctaPrimary}
                onChange={(e) => setCtaPrimary(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Section 2: Halaman Tentang Kami */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D9D7CF] pb-3">
            <Layers className="w-4 h-4 text-muted-olive" />
            <h3 className="text-sm font-bold text-deep-charcoal">
              Halaman Tentang Arvanta Studio
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Pengenalan Studio (About Intro)
              </label>
              <textarea
                rows={4}
                required
                value={aboutIntro}
                onChange={(e) => setAboutIntro(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">
                Visi & Misi Perusahaan
              </label>
              <textarea
                rows={3}
                required
                value={aboutVision}
                onChange={(e) => setAboutVision(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs leading-relaxed"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
