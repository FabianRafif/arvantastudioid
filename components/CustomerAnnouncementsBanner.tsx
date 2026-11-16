"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, ArrowRight, X, Wrench, Sparkles, Info } from "lucide-react";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

interface AnnouncementItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary?: string | null;
  content: string;
  priority: string;
  publishDate: string | Date;
}

export default function CustomerAnnouncementsBanner({
  initialAnnouncements = [],
}: {
  initialAnnouncements?: AnnouncementItem[];
}) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const fetchLatest = async () => {
    try {
      const res = await fetch(`/api/announcements?limit=5&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    // Cross-tab real-time sync
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => fetchLatest();
      }
    } catch {}

    const interval = setInterval(fetchLatest, 10000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, []);

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-3">
      {visibleAnnouncements.map((item) => {
        const isUrgent = item.priority === "URGENT";
        const isPenting = item.priority === "PENTING";

        const bgClass = isUrgent
          ? "bg-red-500/10 border-red-500/40 text-red-950"
          : isPenting
          ? "bg-amber-500/10 border-amber-500/40 text-amber-950"
          : "bg-white border-[#D9D7CF] text-deep-charcoal shadow-2xs";

        const badgeClass = isUrgent
          ? "bg-red-600 text-white animate-pulse"
          : isPenting
          ? "bg-amber-600 text-white"
          : "bg-[#FF9857] text-[#2D2D2D]";

        const snippet = item.summary || item.content.replace(/<[^>]*>?/gm, "").slice(0, 140);

        return (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-xs border transition-all ${bgClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}
          >
            <div className="flex items-start gap-3.5">
              <div className="shrink-0 mt-0.5">
                {isUrgent ? (
                  <div className="p-2 bg-red-600 text-white rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : isPenting ? (
                  <div className="p-2 bg-amber-600 text-white rounded-full">
                    <Wrench className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2 bg-[#2D2D2D] text-[#FF9857] rounded-full">
                    <Bell className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${badgeClass}`}>
                    {item.priority}
                  </span>
                  <span className="text-[11px] font-mono text-deep-charcoal/60 uppercase">
                    {item.category} • {new Date(item.publishDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="font-space font-bold text-sm sm:text-base text-deep-charcoal">
                  {item.title}
                </h3>

                {snippet && (
                  <p className="text-xs text-deep-charcoal/80 line-clamp-2 max-w-3xl leading-relaxed">
                    {snippet}...
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <Link
                href={`/pengumuman/${item.slug}`}
                className="px-4 py-2 bg-deep-charcoal hover:bg-[#FF9857] text-warm-ivory hover:text-[#2D2D2D] text-xs font-bold font-space uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Baca Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => handleDismiss(item.id)}
                className="p-2 text-deep-charcoal/40 hover:text-deep-charcoal hover:bg-black/5 rounded-xs transition-colors"
                title="Sembunyikan Pengumuman"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
