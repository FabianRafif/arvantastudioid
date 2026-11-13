"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Bell, ArrowRight, X, Sparkles, Wrench, Calendar, Info } from "lucide-react";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

interface Announcement {
  id: string;
  title: string;
  slug: string;
  category: string;
  priority: "NORMAL" | "PENTING" | "URGENT";
  summary?: string | null;
}

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const fetchUrgentAnnouncement = async () => {
    try {
      const res = await fetch(`/api/announcements?urgent=true&limit=1&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.announcements) && data.announcements.length > 0) {
        setAnnouncement(data.announcements[0]);
      } else {
        setAnnouncement(null);
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchUrgentAnnouncement();

    // Cross-tab real-time sync
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => fetchUrgentAnnouncement();
      }
    } catch {}

    const interval = setInterval(fetchUrgentAnnouncement, 5000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, []);

  if (!announcement || dismissedId === announcement.id) {
    return null;
  }

  const isUrgent = announcement.priority === "URGENT";

  return (
    <div
      role="region"
      aria-label="Pengumuman Penting"
      className={`relative z-60 w-full px-4 py-2 text-xs font-space transition-colors border-b ${
        isUrgent
          ? "bg-[#D9381E] text-white border-red-800 shadow-md"
          : "bg-[#2D2D2D] text-[#EDECE8] border-[#1f1f1f]"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              isUrgent ? "bg-white text-[#D9381E] animate-pulse" : "bg-[#FF9857] text-[#2D2D2D]"
            }`}
          >
            {announcement.priority}
          </span>

          <span className="truncate text-xs font-semibold">
            {announcement.title}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/pengumuman/${announcement.slug}`}
            className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider underline hover:opacity-80 transition-opacity ${
              isUrgent ? "text-white" : "text-[#FF9857]"
            }`}
          >
            <span>Baca Rincian</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={() => setDismissedId(announcement.id)}
            className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup Pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
