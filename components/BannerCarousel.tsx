"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { LIVE_SYNC_CHANNEL_NAME } from "@/lib/live-sync";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl: string;
  targetUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface BannerCarouselProps {
  initialBanners?: BannerItem[];
  autoSlideInterval?: number; // default 3500ms
  showHeader?: boolean;
  compact?: boolean;
  className?: string;
}

export default function BannerCarousel({
  initialBanners = [],
  autoSlideInterval = 3500,
  showHeader = true,
  compact = false,
  className = "",
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannersSignatureRef = useRef<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time instant synchronization with server without requiring page refresh (polls every 2.5s with cache-busting)
  useEffect(() => {
    let isMounted = true;

    const fetchBanners = async () => {
      try {
        const res = await fetch(`/api/banners?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.banners) && isMounted) {
          const signature = JSON.stringify(
            data.banners.map((b: any) => `${b.id}-${b.imageUrl}-${b.title}-${b.isActive}`)
          );
          if (signature !== bannersSignatureRef.current) {
            bannersSignatureRef.current = signature;
            setBanners(data.banners);
          }
        }
      } catch {
        // Silently preserve current state
      }
    };

    fetchBanners();

    // 1. Cross-tab BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LIVE_SYNC_CHANNEL_NAME);
        channel.onmessage = () => {
          fetchBanners();
        };
      }
    } catch {}

    // 2. Cross-window storage event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "arvanta_live_sync_trigger") {
        fetchBanners();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Heartbeat polling every 2.5s to guarantee fresh sync across different devices/networks
    const pollInterval = setInterval(fetchBanners, 2500);

    return () => {
      isMounted = false;
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(pollInterval);
    };
  }, []);

  // Guaranteed continuous auto-slide without requiring manual buttons
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (banners.length || 1));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, autoSlideInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, autoSlideInterval, nextSlide]);

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section
      className={
        className ||
        (compact
          ? "w-full my-6"
          : "relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14")
      }
    >
      {/* Section Header (Clean headline without manual arrow buttons) */}
      {showHeader && (
        <div className="mb-6 sm:mb-8">
          <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block mb-2">
            // 02 · CASE STUDIES &amp; OFFERS
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
            PENAWARAN &amp; KAMPANYE PROMO TERKINI
          </h2>
        </div>
      )}

      {/* Container: 160 x 60 cm (8:3) with Rounded 2xl Frame */}
      <div
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[8/3] ${
          compact ? "max-h-[360px]" : "md:max-h-[520px]"
        } bg-[#2D2D2D] rounded-2xl overflow-hidden border border-[#D8D8D4] shadow-xl select-none group`}
      >
        {/* PHYSICAL HORIZONTAL SLIDING TRACK */}
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => {
            const cleanBadge = (banner.badge || "")
              .replace(/[\u26A1\u2728\u2B50\u2605\uD83D\uDD25\uD83D\uDCBB\uD83C\uDFA8]/g, "")
              .replace(/[⚡✨★⭐🔥]/g, "")
              .trim();

            const isDefaultSvgWithMobile =
              banner.imageUrl === "/uploads/banners/banner-web-development.svg" ||
              banner.imageUrl === "/uploads/banners/banner-graphic-design.svg";

            const mobileImageUrl = isDefaultSvgWithMobile
              ? banner.imageUrl.replace(/\.svg$/, "-mobile.svg")
              : null;

            return (
              <div key={banner.id || index} className="w-full h-full shrink-0 relative">
                <Link
                  href={banner.targetUrl || "/order"}
                  className="block w-full h-full relative cursor-pointer"
                >
                  <picture className="w-full h-full block">
                    {mobileImageUrl && (
                      <source media="(max-width: 767px)" srcSet={mobileImageUrl} />
                    )}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover object-center pointer-events-none"
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const retryCount = Number(target.dataset.retry || "0");
                        if (retryCount === 0 && banner.imageUrl.startsWith("/uploads/")) {
                          target.dataset.retry = "1";
                          target.src = "/api" + banner.imageUrl;
                          return;
                        }
                        if (retryCount === 1) {
                          target.dataset.retry = "2";
                          target.src =
                            banner.imageUrl +
                            (banner.imageUrl.includes("?") ? "&" : "?") +
                            "t=" +
                            Date.now();
                        }
                      }}
                    />
                  </picture>

                  {/* Clean Badge */}
                  {cleanBadge && (
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 pointer-events-none hidden sm:block">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#2D2D2D]/95 text-white text-[10px] sm:text-xs font-space font-semibold uppercase tracking-wider rounded-full border border-white/20 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9857]" />
                        <span>{cleanBadge}</span>
                      </span>
                    </div>
                  )}

                  {/* Dimension Tag */}
                  <div className="absolute bottom-3 right-4 z-10 pointer-events-none hidden md:block">
                    <span className="text-[10px] font-space text-white/50 tracking-widest uppercase">
                      160 × 60 cm Landscape
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators / Dots (Bottom Center) */}
        {banners.length > 1 && (
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === i
                    ? "w-6 h-1.5 bg-[#FF9857]"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white"
                }`}
                aria-label={`Lihat banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
