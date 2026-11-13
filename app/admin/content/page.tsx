"use client";

import { useState, useEffect } from "react";
import { Layers, Save, CheckCircle2, AlertCircle, Globe, Sparkles } from "lucide-react";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Content Fields
  const [headline, setHeadline] = useState("Digital Solutions, Built with Purpose.");
  const [subheadline, setSubheadline] = useState("Arvanta Studio membangun website eksklusif, sistem manajemen bisnis, dan ekosistem digital berkinerja tinggi untuk membawa usaha Anda melangkah ke tingkat berikutnya.");
  const [ctaPrimary, setCtaPrimary] = useState("Mulai Konsultasi & Order");
  const [aboutIntro, setAboutIntro] = useState("Arvanta Studio merupakan penyedia jasa pembuatan website dan sistem digital untuk membantu bisnis, organisasi, institusi, dan UMKM berkembang melalui teknologi yang tepat guna.");
  const [aboutVision, setAboutVision] = useState("Menjadi mitra transformasi digital nomor satu yang menghadirkan teknologi andal, berestetika tinggi, dan berdampak nyata bagi pertumbuhan bisnis.");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          if (data.settings.HERO_HEADLINE) setHeadline(data.settings.HERO_HEADLINE);
          if (data.settings.HERO_SUBHEADLINE) setSubheadline(data.settings.HERO_SUBHEADLINE);
          if (data.settings.HERO_CTA_PRIMARY) setCtaPrimary(data.settings.HERO_CTA_PRIMARY);
          if (data.settings.ABOUT_INTRO) setAboutIntro(data.settings.ABOUT_INTRO);
          if (data.settings.ABOUT_VISION) setAboutVision(data.settings.ABOUT_VISION);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/content", {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan konten.");

      setFeedback({ type: "success", text: data.message });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            CMS Konten Website & Beranda
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Ubah teks headline, penjelasan layanan, dan visi misi tanpa perlu mengubah kode program.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Menyimpan..." : "Publikasikan Perubahan"}</span>
        </button>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Hero Beranda */}
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

        {/* Section 2: Halaman Tentang Kami */}
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
