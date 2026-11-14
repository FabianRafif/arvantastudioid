"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import TechIcon from "./TechIcons";
import { LIVE_SYNC_CHANNEL_NAME, LIVE_SYNC_STORAGE_KEY } from "@/lib/live-sync";
import {
  RunningItem,
  RunningTextConfig,
  DEFAULT_RUNNING_TEXT_CONFIG,
} from "@/lib/running-text";

export type { RunningItem, RunningTextConfig };
export { DEFAULT_RUNNING_TEXT_CONFIG };

interface RunningTextMarqueeProps {
  initialConfig?: RunningTextConfig | null;
}

export default function RunningTextMarquee({ initialConfig }: RunningTextMarqueeProps) {
  const [config, setConfig] = useState<RunningTextConfig>(
    initialConfig || DEFAULT_RUNNING_TEXT_CONFIG
  );
  
  // Track JSON representation so we never re-render or reset animation if data is identical
  const configJsonRef = useRef<string>(
    JSON.stringify(initialConfig || DEFAULT_RUNNING_TEXT_CONFIG)
  );

  const fetchLatestConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/running-text", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.config) {
        const newJson = JSON.stringify(data.config);
        // Only trigger state update if config actually changed
        if (newJson !== configJsonRef.current) {
          configJsonRef.current = newJson;
          setConfig(data.config);
        }
      }
    } catch {
      // Fallback silently without interrupting running animation
    }
  }, []);

  useEffect(() => {
    // 1. Initial background fetch to verify current version
    fetchLatestConfig();

    // 2. BroadcastChannel for 0ms cross-tab instant sync from Admin
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

    // 3. Storage event listener (multi-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LIVE_SYNC_STORAGE_KEY) {
        fetchLatestConfig();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Periodic polling heartbeat (every 3 seconds) for instant cross-device updates
    const interval = setInterval(fetchLatestConfig, 3000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [fetchLatestConfig]);

  if (!config.enabled) return null;

  const activeItems = useMemo(
    () => config.items.filter((it) => it.isActive),
    [config.items]
  );
  if (activeItems.length === 0) return null;

  // Build ultra-wide track with 4 repetitions per half so that even on 4K/ultra-wide screens,
  // there is NEVER any empty space, pause, or gap when looping.
  const REPEAT_COUNT = 4;
  const repeatedTrackItems = useMemo(() => {
    const list: Array<RunningItem & { _uKey: string }> = [];
    for (let r = 0; r < REPEAT_COUNT; r++) {
      for (let i = 0; i < activeItems.length; i++) {
        list.push({
          ...activeItems[i],
          _uKey: `r${r}-i${activeItems[i].id}-${i}`,
        });
      }
    }
    return list;
  }, [activeItems]);

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

  // Calculate speed: based on number of items to ensure steady, readable, consistent flow
  const baseItemSpeed = (config.speed || 24) / Math.max(1, activeItems.length);
  const totalSpeedSeconds = Math.max(25, Math.min(180, Math.round(repeatedTrackItems.length * Math.max(1.2, baseItemSpeed))));

  // Render a single item
  const renderItem = (
    item: RunningItem & { _uKey: string },
    trackPrefix: string
  ) => (
    <div
      key={`${trackPrefix}-${item._uKey}`}
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
          "--marquee-speed": `${totalSpeedSeconds}s`,
        } as React.CSSProperties
      }
      title="Teknologi & Desain Resmi Arvanta Studio"
    >
      {/* Subtle edge fade gradient mask for ultra-smooth entry and exit */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-inherit to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-inherit to-transparent z-10" />

      {/* Infinite Seamless Scrolling Track: 
          Track 1 (50%) + Track 2 (50%) are identical clones.
          When transform translates from 0% to -50%, it loops endlessly with ZERO empty space and ZERO pause! */}
      <div className="animate-marquee-infinite flex items-center">
        {/* Track 1 (Half 1) */}
        <div className="flex items-center shrink-0">
          {repeatedTrackItems.map((item) => renderItem(item, "t1"))}
        </div>
        {/* Track 2 (Half 2 - Exact clone) */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          {repeatedTrackItems.map((item) => renderItem(item, "t2"))}
        </div>
      </div>
    </div>
  );
}
