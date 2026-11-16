"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowUpRight, Tag, AlertTriangle, Wrench, Bell, ArrowRight } from "lucide-react";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

interface AnnouncementItem {
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

const CATEGORIES = [
  { id: "ALL", label: "Semua Kategori" },
  { id: "PROMO", label: "Promo & Diskon" },
  { id: "LAYANAN", label: "Layanan Baru" },
  { id: "HARGA", label: "Pembaruan Tarif" },
  { id: "OPERASIONAL", label: "Libur & Jadwal" },
  { id: "MAINTENANCE", label: "Maintenance" },
  { id: "INFO_PENTING", label: "Info Penting" },
];

export default function AnnouncementsClientExplorer({
  initialItems,
}: {
  initialItems: AnnouncementItem[];
}) {
  const [items, setItems] = useState<AnnouncementItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshItems = async () => {
    try {
      const res = await fetch(`/api/announcements?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.announcements)) {
        setItems(data.announcements);
      }
    } catch {}
  };

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => refreshItems();
      }
    } catch {}

    const interval = setInterval(refreshItems, 8000);
    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.summary &&
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const featuredAlert = useMemo(() => {
    return (
      items.find((i) => i.priority === "URGENT") ||
      items.find((i) => i.category === "MAINTENANCE") ||
      items.find((i) => i.priority === "PENTING") ||
      null
    );
  }, [items]);

  return (
    <div className="space-y-8">
      {/* Hero Featured Alert Banner (Maintenance / Urgent / Penting) */}
      {featuredAlert && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border-2 transition-all relative overflow-hidden shadow-md ${
            featuredAlert.priority === "URGENT" || featuredAlert.category === "MAINTENANCE"
              ? "bg-gradient-to-r from-red-950/90 via-[#2D2D2D] to-[#1C1C1A] text-white border-red-500/80"
              : "bg-gradient-to-r from-[#2D2D2D] via-[#242424] to-[#1A1A1A] text-white border-[#FF9857]/80"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl text-[#FF9857] shrink-0 mt-1">
                {featuredAlert.category === "MAINTENANCE" ? (
                  <Wrench className="w-6 h-6 text-[#FF9857] animate-pulse" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      featuredAlert.priority === "URGENT" || featuredAlert.category === "MAINTENANCE"
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-[#FF9857] text-[#2D2D2D]"
                    }`}
                  >
                    {featuredAlert.category === "MAINTENANCE"
                      ? "PEMBERITAHUAN MAINTENANCE"
                      : `${featuredAlert.priority} NOTICE`}
                  </span>
                  <span className="text-xs font-mono text-white/60">
                    {new Date(featuredAlert.publishDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white uppercase">
                  {featuredAlert.title}
                </h3>
                {featuredAlert.summary && (
                  <p className="text-xs sm:text-sm text-white/80 max-w-3xl leading-relaxed font-sans">
                    {featuredAlert.summary}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/pengumuman/${featuredAlert.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF9857] hover:bg-[#FF8840] text-[#2D2D2D] font-bold font-space text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 active:scale-95"
            >
              <span>Baca Rincian Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 font-space text-xs">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-[#2D2D2D] text-white"
                  : "bg-white/80 hover:bg-white text-[#2D2D2D] border border-[#D8D8D4]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787875]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengumuman..."
            className="w-full pl-9.5 pr-4 py-2 bg-white rounded-full border border-[#D8D8D4] text-xs focus:outline-hidden focus:border-[#2D2D2D] transition-colors"
          />
        </div>
      </div>

      {/* Grid of Announcements */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-white/50 rounded-2xl border border-[#D8D8D4] space-y-3">
          <p className="text-sm font-space text-[#787875]">
            Belum ada pengumuman yang sesuai dengan kriteria filter.
          </p>
          {(selectedCategory !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-space font-bold text-[#FF9857] hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isUrgent = item.priority === "URGENT";
            const isPenting = item.priority === "PENTING";
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
                    ? "border-red-300 bg-red-50/15"
                    : isPenting
                    ? "border-amber-300 bg-amber-50/15"
                    : "border-[#D8D8D4] hover:border-[#2D2D2D]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider bg-[#EDECE8] text-[#2D2D2D] border border-[#D8D8D4]">
                      {CATEGORIES.find((c) => c.id === item.category)?.label || item.category}
                    </span>

                    {(isUrgent || isPenting) && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-space font-bold uppercase tracking-wider ${
                          isUrgent ? "bg-red-600 text-white animate-pulse" : "bg-amber-500 text-white"
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

                  <h2 className="text-xl sm:text-2xl font-bold font-bebas text-[#2D2D2D] tracking-wide group-hover:text-[#FF9857] transition-colors line-clamp-2">
                    {item.title}
                  </h2>

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
      )}
    </div>
  );
}
