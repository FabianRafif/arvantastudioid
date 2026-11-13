"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LIVE_SYNC_CHANNEL_NAME, LIVE_SYNC_STORAGE_KEY } from "./live-sync";

export interface LivePackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: any;
  deliveryDays: number;
  revisions: number;
  isPopular: boolean;
  isActive: boolean;
  service?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
  };
}

export interface LiveService {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceFrom: number;
  priceTo?: number | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  packages?: LivePackage[];
}

export interface LiveFlashSale {
  isActive: boolean;
  title: string;
  subtitle: string;
  discountPercent: number;
  voucherCode: string;
  endTime: string | null;
}

export interface LiveCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface LiveBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export interface LiveSyncData {
  version: string;
  timestamp: number;
  pricing: {
    packages: LivePackage[];
    services: LiveService[];
    lowestWebsitePrice: number;
    lowestDesignPrice: number;
  };
  promotions: {
    flashSale: LiveFlashSale;
    coupons: LiveCoupon[];
    banners: LiveBanner[];
    navbarBadge: string | null;
  };
}

export function useLiveSync(initialData?: Partial<LiveSyncData>) {
  const [data, setData] = useState<LiveSyncData>({
    version: initialData?.version || "init",
    timestamp: initialData?.timestamp || Date.now(),
    pricing: {
      packages: initialData?.pricing?.packages || [],
      services: initialData?.pricing?.services || [],
      lowestWebsitePrice: initialData?.pricing?.lowestWebsitePrice || 1500000,
      lowestDesignPrice: initialData?.pricing?.lowestDesignPrice || 39000,
    },
    promotions: {
      flashSale: initialData?.promotions?.flashSale || {
        isActive: false,
        title: "PROMO SPESIAL ARVANTA STUDIO",
        subtitle: "Dapatkan penawaran terbaik pembuatan website & sistem digital Anda.",
        discountPercent: 20,
        voucherCode: "PROMO20",
        endTime: null,
      },
      coupons: initialData?.promotions?.coupons || [],
      banners: initialData?.promotions?.banners || [],
      navbarBadge: initialData?.promotions?.navbarBadge || null,
    },
  });

  const [hasUpdated, setHasUpdated] = useState(false);
  const versionRef = useRef(data.version);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/live-sync", { cache: "no-store" });
      if (!res.ok) return;
      const latest: LiveSyncData = await res.json();
      if (latest && latest.version !== versionRef.current) {
        versionRef.current = latest.version;
        setData(latest);
        setHasUpdated(true);
        setTimeout(() => setHasUpdated(false), 2000);
      }
    } catch (err) {
      console.debug("Live sync fetch error:", err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount
    fetchLatest();

    // 1. Listen to BroadcastChannel (Instant 0ms multi-tab sync)
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => {
          fetchLatest();
        };
      }
    } catch {
      // ignore
    }

    // 2. Listen to storage event (Fallback multi-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LIVE_SYNC_STORAGE_KEY) {
        fetchLatest();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Periodic lightweight polling every 3.5s (Sync cross-device / multi-browser)
    const interval = setInterval(() => {
      fetchLatest();
    }, 3500);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [fetchLatest]);

  return {
    ...data,
    hasUpdated,
    refreshNow: fetchLatest,
  };
}
