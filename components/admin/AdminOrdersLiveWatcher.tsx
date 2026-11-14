"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LIVE_SYNC_CHANNEL_NAME, LIVE_SYNC_STORAGE_KEY } from "@/lib/live-sync";

export default function AdminOrdersLiveWatcher() {
  const router = useRouter();

  useEffect(() => {
    // 1. Listen to BroadcastChannel for instant multi-tab sync
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => {
          router.refresh();
        };
      }
    } catch {}

    // 2. Storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LIVE_SYNC_STORAGE_KEY) {
        router.refresh();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Periodic polling (every 4 seconds) to ensure cross-device real-time updates
    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
