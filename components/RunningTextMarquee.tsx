"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import TechIcon from "./TechIcons";
import { LIVE_SYNC_CHANNEL_NAME, LIVE_SYNC_STORAGE_KEY } from "@/lib/live-sync";

export interface RunningItem {
  id: string;
  icon: string;
  text: string;
  customIconUrl?: string;
  isActive: boolean;
}

export interface RunningTextConfig {
  enabled: boolean;
  speed: number; // in seconds, default 28
  theme: "light" | "dark" | "orange";
  separator: string; // e.g. "✦" or "//" or "•"
  items: RunningItem[];
}

export const DEFAULT_RUNNING_TEXT_CONFIG: RunningTextConfig = {
  enabled: true,
  speed: 28,
  theme: "light",
  separator: "✦",
  items: [
    { id: "1", icon: "canva", text: "Logo Canva | Canva", isActive: true },
    { id: "2", icon: "figma", text: "Logo Figma | Figma", isActive: true },
    { id: "3", icon: "nextjs", text: "Logo Next.JS | Next.JS", isActive: true },
    { id: "4", icon: "react", text: "Logo React | React", isActive: true },
    { id: "5", icon: "tailwind", text: "Logo Tailwind CSS | Tailwind CSS", isActive: true },
    { id: "6", icon: "typescript", text: "Logo TypeScript | TypeScript", isActive: true },
    { id: "7", icon: "nodejs", text: "Logo Node.JS | Node.JS", isActive: true },
    { id: "8", icon: "wordpress", text: "Logo WordPress | WordPress", isActive: true },
  ],
};

interface RunningTextMarqueeProps {
  initialConfig?: RunningTextConfig | null;
}

export default function RunningTextMarquee({ initialConfig }: RunningTextMarqueeProps) {
  const [config, setConfig] = useState<RunningTextConfig>(
    initialConfig || DEFAULT_RUNNING_TEXT_CONFIG
  );
  const lastFetchedVersionRef = useRef<string>("");

  const fetchLatestConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/running-text", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.config && data?.version !== lastFetchedVersionRef.current) {
        lastFetchedVersionRef.current = data.version || "";
        setConfig(data.config);
      }
    } catch {
      // Fallback silently
    }
  }, []);

  useEffect(() => {
    // 1. Initial fetch on mount to sync immediately
    fetchLatestConfig();

    // 2. BroadcastChannel for 0ms same-origin cross-tab instant sync
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => {
          fetchLatestConfig();
        };
      }
    } catch {
      // Ignore
    }

    // 3. Storage event fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LIVE_SYNC_STORAGE_KEY) {
        fetchLatestConfig();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Heartbeat polling every 3 seconds for instant cross-device updates
    const interval = setInterval(fetchLatestConfig, 3000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [fetchLatestConfig]);

  if (!config.enabled) return null;

  const activeItems = config.items.filter((it) => it.isActive);
  if (activeItems.length === 0) return null;

  // Theme styling
  const themeClasses =
    config.theme === "dark"
      ? "bg-[#2D2D2D] text-[#EDECE8] border-[#3D3D3D]"
      : config.theme === "orange"
      ? "bg-[#FF9857] text-[#2D2D2D] border-[#E57E3D]"
      : "bg-[#F6F5F2] text-[#2D2D2D] border-[#D8D8D4]";

  const separatorColor =
    config.theme === "dark"
      ? "text-[#FF9857]"
      : config.theme === "orange"
      ? "text-white"
      : "text-[#FF9857]";

  const speedSeconds = Math.max(10, Math.min(120, config.speed || 28));

  // Render a single strip item
  const renderItem = (item: RunningItem, idx: number, trackKey: string) => (
    <div
      key={`${trackKey}-${item.id}-${idx}`}
      className="inline-flex items-center gap-3 shrink-0 select-none group/item"
    >
      <div className="flex items-center justify-center transition-transform group-hover/item:scale-110">
        <TechIcon
          name={item.icon}
          customIconUrl={item.customIconUrl}
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      </div>

      <span className="font-space font-semibold text-xs sm:text-[13px] tracking-widest uppercase">
        {item.text}
      </span>

      <span
        aria-hidden="true"
        className={`mx-3 sm:mx-4 text-xs font-bold ${separatorColor} opacity-80`}
      >
        {config.separator || "✦"}
      </span>
    </div>
  );

  return (
    <div
      className={`marquee-container relative w-full overflow-hidden border-y py-3 sm:py-3.5 transition-colors duration-300 z-10 ${themeClasses}`}
      style={
        {
          "--marquee-speed": `${speedSeconds}s`,
        } as React.CSSProperties
      }
      title="Teknologi & Desain Resmi Arvanta Studio"
    >
      {/* Subtle edge fade gradient mask for ultra-smooth entry and exit */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-inherit to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-inherit to-transparent z-10" />

      {/* Infinite Seamless Scrolling Track (Duplicated twice for continuous loop without delay) */}
      <div className="animate-marquee-infinite flex items-center">
        {/* Track 1 */}
        <div className="flex items-center shrink-0">
          {activeItems.map((item, idx) => renderItem(item, idx, "track1"))}
        </div>
        {/* Track 2 (Exact mirror copy so reset from -50% to 0% has ZERO pause or jump) */}
        <div className="flex items-center shrink-0">
          {activeItems.map((item, idx) => renderItem(item, idx, "track2"))}
        </div>
      </div>
    </div>
  );
}
