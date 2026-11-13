"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowUpRight } from "lucide-react";
import { useLiveSync, LivePackage } from "@/lib/useLiveSync";

interface LivePricingCardsProps {
  initialPackages?: LivePackage[];
  isHomepage?: boolean;
}

export default function LivePricingCards({
  initialPackages = [],
  isHomepage = false,
}: LivePricingCardsProps) {
  const liveSync = useLiveSync();
  const fs = liveSync.promotions.flashSale;

  const packages =
    liveSync.pricing.packages.length > 0
      ? liveSync.pricing.packages
      : initialPackages;

  // Filter website packages
  const displayPackages = packages
    .filter((p) => !p.service?.name.toLowerCase().includes("desain"))
    .slice(0, isHomepage ? 3 : 6);

  const isPromo = fs.isActive;
  const discountPercent = fs.discountPercent || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
      {displayPackages.map((pkg) => {
        const basePrice = pkg.price;
        const promoPrice = isPromo
          ? Math.round(basePrice * (1 - discountPercent / 100))
          : basePrice;

        return (
          <div
            key={pkg.id}
            className={`p-7 sm:p-9 rounded-2xl space-y-6 flex flex-col justify-between relative transition-all duration-300 ${
              pkg.isPopular
                ? "bg-white border-2 border-[#2D2D2D] shadow-xl -translate-y-2"
                : "bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] shadow-xs"
            }`}
          >
            {pkg.isPopular && (
              <div className="absolute -top-3.5 right-6 bg-[#FF9857] text-white px-4 py-1 text-[11px] font-semibold font-space tracking-wider uppercase rounded-full shadow-sm">
                Paling Diminati
              </div>
            )}

            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold font-space uppercase tracking-wider text-[#2D2D2D] bg-[#EDECE8] px-3.5 py-1 rounded-full">
                  // {pkg.name}
                </span>
                {isPromo && (
                  <span className="text-[10px] font-bold text-white bg-[#FF9857] px-2.5 py-0.5 rounded-full font-space tracking-wider uppercase">
                    HEMAT {discountPercent}%
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                    Rp{promoPrice.toLocaleString("id-ID")}
                  </span>
                  {isPromo && (
                    <span className="text-sm text-[#787875] line-through font-space">
                      Rp{basePrice.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#787875] block mt-1 font-sans">
                  Sekali bayar jasa pembuatan (Hak Milik Penuh)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#787875] leading-relaxed min-h-[40px]">
                {pkg.description}
              </p>

              <div className="pt-4 border-t border-[#D8D8D4] space-y-2.5 text-xs text-[#2D2D2D]">
                <div className="flex items-center gap-2 text-[11px] text-[#2D2D2D] font-space uppercase tracking-wider font-semibold pb-1">
                  <span>Estimasi {pkg.deliveryDays || 5} Hari</span>
                  <span>•</span>
                  <span>{pkg.revisions || 2}x Revisi</span>
                </div>

                {Array.isArray(pkg.features) &&
                  pkg.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#EDECE8] text-[#FF9857] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-xs text-[#2D2D2D]">{feat}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={`/order?service=WEBSITE&package=${encodeURIComponent(pkg.id)}`}
                className={`w-full py-4 text-center text-xs font-semibold font-space uppercase tracking-wider rounded-full block transition-all cursor-pointer ${
                  pkg.isPopular
                    ? "bg-[#2D2D2D] hover:bg-[#FF9857] text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[#EDECE8] hover:bg-[#2D2D2D] text-[#2D2D2D] hover:text-white"
                }`}
              >
                Pilih Paket Ini ↗
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
