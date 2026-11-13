"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, ArrowRight, Sparkles } from "lucide-react";
import { useLiveSync } from "@/lib/useLiveSync";

interface FlashSaleBarProps {
  initialActive?: boolean;
  title?: string;
  voucherCode?: string;
}

export default function FlashSaleBar({
  initialActive = false,
  title,
  voucherCode,
}: FlashSaleBarProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({ hours: "00", minutes: "00", seconds: "00" });
  const [copied, setCopied] = useState(false);

  const liveSync = useLiveSync();
  const fs = liveSync.promotions.flashSale;

  const currentActive = fs.isActive;
  const currentTitle = title || fs.title || "PROMO SPESIAL ARVANTA STUDIO";
  const currentVoucher = voucherCode || fs.voucherCode || "PROMO20";
  const currentEndTime = fs.endTime;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!currentActive || !currentEndTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(currentEndTime).getTime();
      const diff = Math.max(0, end - now);

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(totalHours).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentActive, currentEndTime]);

  const copyToClipboard = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentVoucher);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentVoucher;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If promo is not active or not mounted yet, render nothing
  if (!mounted || !currentActive) {
    return null;
  }

  return (
    <div className="relative z-40 bg-neutral-900 border-b border-neutral-800 text-white py-2 px-4 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Badge & Title */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>PENAWARAN TERBATAS</span>
          </span>
          <span className="font-medium text-neutral-200 hidden sm:inline">
            {currentTitle}
          </span>
        </div>

        {/* Center: Countdown Timer */}
        {currentEndTime && (
          <div className="flex items-center gap-1.5 font-mono text-neutral-300">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest hidden md:inline">
              Berakhir:
            </span>
            <div className="flex items-center gap-1 font-bold text-white bg-black/40 px-2 py-1 rounded">
              <span>{timeLeft.hours}</span>
              <span className="text-neutral-500">:</span>
              <span>{timeLeft.minutes}</span>
              <span className="text-neutral-500">:</span>
              <span>{timeLeft.seconds}</span>
            </div>
          </div>
        )}

        {/* Right: Voucher & Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1 rounded font-mono text-xs transition-colors cursor-pointer border border-neutral-700"
            title="Klik untuk menyalin kode voucher"
          >
            <span>Kupon: <strong className="text-white">{currentVoucher}</strong></span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>

          <Link
            href={`/order?promo=${encodeURIComponent(currentVoucher)}`}
            className="flex items-center gap-1 bg-white hover:bg-neutral-100 text-neutral-900 px-3 py-1 rounded font-semibold text-xs transition-colors shrink-0"
          >
            <span>Klaim Diskon</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
