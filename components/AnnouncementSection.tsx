"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Bell, Calendar, Tag, AlertTriangle, Sparkles, Wrench } from "lucide-react";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

interface Announcement {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary?: string | null;
  imageUrl?: string | null;
  priority: "NORMAL" | "PENTING" | "URGENT";
  publishDate: string;
  authorName?: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  PROMO: "Promo & Diskon",
  LAYANAN: "Layanan Baru",
  HARGA: "Pembaruan Tarif",
  OPERASIONAL: "Libur & Jadwal",
  MAINTENANCE: "Pemeliharaan Sistem",
  INFO_PENTING: "Informasi Penting",
};

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`/api/announcements?limit=4&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => fetchAnnouncements();
      }
    } catch {}

    const interval = setInterval(fetchAnnouncements, 8000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, []);

  if (!loading && announcements.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 border-b border-[#D8D8D4] bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block mb-2">
              // PENGUMUMAN &amp; BERITA RESMI
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
              INFORMASI &amp; PEMBARUAN STUDIO
            </h2>
          </div>

          <Link
            href="/pengumuman"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D8D8D4] hover:border-[#2D2D2D] text-xs font-space font-semibold uppercase tracking-wider text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white transition-all self-start md:self-auto"
          >
            <span>Semua Pengumuman</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.slice(0, 3).map((item) => {
            const isUrgent = item.priority === "URGENT";
            const isPenting = item.priority === "PENTING";
            const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

            const dateStr = new Date(item.publishDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group ${
                  isUrgent
                    ? "border-red-300 bg-red-50/20"
                    : isPenting
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-[#D8D8D4] hover:border-[#2D2D2D]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider bg-[#EDECE8] text-[#2D2D2D] border border-[#D8D8D4]">
                      {categoryLabel}
                    </span>

                    {(isUrgent || isPenting) && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-space font-bold uppercase tracking-wider ${
                          isUrgent
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {item.priority}
                      </span>
                    )}
                  </div>

                  {item.imageUrl && (
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#2D2D2D] border border-[#D8D8D4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <h3 className="text-xl sm:text-2xl font-bold font-bebas text-[#2D2D2D] tracking-wide group-hover:text-[#FF9857] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {item.summary && (
                    <p className="text-xs text-[#787875] line-clamp-3 leading-relaxed font-sans">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-[#D8D8D4] flex items-center justify-between gap-3 text-xs font-space text-[#787875]">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </span>

                  <Link
                    href={`/pengumuman/${item.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#2D2D2D] group-hover:text-[#FF9857] hover:underline"
                  >
                    <span>Baca Rincian</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
