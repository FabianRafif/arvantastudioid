"use client";

import { useLiveSync } from "@/lib/useLiveSync";
import { Sparkles } from "lucide-react";
import Link from "next/link";

function formatRupiahShort(amount: number): string {
  if (amount >= 1000000) {
    const val = amount / 1000000;
    return `Rp${val % 1 === 0 ? val : val.toFixed(1).replace(".", ",")}jt`;
  }
  if (amount >= 1000) {
    const val = amount / 1000;
    return `Rp${val % 1 === 0 ? val : val.toFixed(0)}rb`;
  }
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export default function HeroQuickPricing({
  initialWebsitePrice = 1500000,
  initialDesignPrice = 39000,
  darkVariant = false,
}: {
  initialWebsitePrice?: number;
  initialDesignPrice?: number;
  darkVariant?: boolean;
}) {
  const liveSync = useLiveSync();
  const fs = liveSync.promotions.flashSale;

  const websiteBase = liveSync.pricing.lowestWebsitePrice || initialWebsitePrice;
  const designBase = liveSync.pricing.lowestDesignPrice || initialDesignPrice;

  const isPromo = fs.isActive;
  const discountPercent = fs.discountPercent || 0;

  const websitePromoPrice = isPromo
    ? Math.round(websiteBase * (1 - discountPercent / 100))
    : websiteBase;

  const designPromoPrice = isPromo
    ? Math.round(designBase * (1 - discountPercent / 100))
    : designBase;

  return (
    <div className="grid grid-cols-2 gap-3 transition-all duration-300">
      {/* Website Card */}
      <Link
        href="/services"
        className={`group p-4 rounded-xl relative overflow-hidden transition-all block border ${
          darkVariant
            ? "bg-[#181816] border-[#333331] hover:border-[#FF9857] text-white"
            : "bg-white/80 hover:bg-white border-[#D8D8D4] hover:border-[#2D2D2D] text-[#2D2D2D] shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          {isPromo ? (
            <span className="text-[10px] font-bold text-white bg-[#FF9857] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-space tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{discountPercent}% OFF</span>
            </span>
          ) : (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase font-space tracking-wider ${
                darkVariant ? "text-neutral-300 bg-white/10" : "text-[#2D2D2D] bg-[#EDECE8]"
              }`}
            >
              <span>Website</span>
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span
            className={`text-2xl sm:text-3xl font-bold font-bebas tracking-wide transition-colors ${
              darkVariant ? "text-white" : "text-[#2D2D2D] group-hover:text-[#FF9857]"
            }`}
          >
            {formatRupiahShort(websitePromoPrice)}
          </span>
          {isPromo && (
            <span className="text-xs text-[#787875] line-through font-space">
              {formatRupiahShort(websiteBase)}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] uppercase font-space tracking-wider block mt-0.5 ${
            darkVariant ? "text-neutral-400" : "text-[#787875]"
          }`}
        >
          Mulai Dari
        </span>
      </Link>

      {/* Graphic Design Card */}
      <Link
        href="/services#design-catalog"
        className={`group p-4 rounded-xl relative overflow-hidden transition-all block border ${
          darkVariant
            ? "bg-[#181816] border-[#333331] hover:border-[#FF9857] text-white"
            : "bg-white/80 hover:bg-white border-[#D8D8D4] hover:border-[#2D2D2D] text-[#2D2D2D] shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          {isPromo ? (
            <span className="text-[10px] font-bold text-white bg-[#FF9857] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-space tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{discountPercent}% OFF</span>
            </span>
          ) : (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase font-space tracking-wider ${
                darkVariant ? "text-neutral-300 bg-white/10" : "text-[#2D2D2D] bg-[#EDECE8]"
              }`}
            >
              <span>Desain</span>
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span
            className={`text-2xl sm:text-3xl font-bold font-bebas tracking-wide transition-colors ${
              darkVariant ? "text-white" : "text-[#2D2D2D] group-hover:text-[#FF9857]"
            }`}
          >
            {formatRupiahShort(designPromoPrice)}
          </span>
          {isPromo && (
            <span className="text-xs text-[#787875] line-through font-space">
              {formatRupiahShort(designBase)}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] uppercase font-space tracking-wider block mt-0.5 ${
            darkVariant ? "text-neutral-400" : "text-[#787875]"
          }`}
        >
          Mulai Dari
        </span>
      </Link>
    </div>
  );
}
