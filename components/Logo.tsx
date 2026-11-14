import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "dark" | "light" | "auto";
  type?: "full" | "symbol";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  href?: string;
  withTagline?: boolean;
}

export default function Logo({
  variant = "dark",
  type = "full",
  size = "md",
  className = "",
  href,
  withTagline = false,
}: LogoProps) {
  // Dimensions mapping
  const sizeMap = {
    sm: { symbol: 28, fullH: 32, fullW: 120, text: "text-base", sub: "text-[9px]" },
    md: { symbol: 36, fullH: 42, fullW: 156, text: "text-lg", sub: "text-[10px]" },
    lg: { symbol: 48, fullH: 56, fullW: 200, text: "text-2xl", sub: "text-xs" },
    xl: { symbol: 64, fullH: 76, fullW: 270, text: "text-3xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isLight = variant === "light";

  // Using the user-provided high-definition assets (1024x1024 master, transparent PNG + vector SVG)
  // Sharp rendering without any pixelation or blur
  const symbolSrc = isLight
    ? "/images/arvanta-symbol-white.png"
    : "/images/arvanta-symbol-dark.png";

  const fullSrc = isLight
    ? "/images/arvanta-logo-white.png"
    : "/images/arvanta-logo-dark.png";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {type === "symbol" ? (
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: currentSize.symbol, height: currentSize.symbol }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={symbolSrc}
            alt="Arvanta Studio Symbol"
            width={currentSize.symbol}
            height={currentSize.symbol}
            decoding="async"
            className="w-full h-full object-contain"
            style={{
              imageRendering: "crisp-edges",
              filter: isLight ? "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" : "none",
            }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div
            className="relative shrink-0 flex items-center justify-center"
            style={{ width: currentSize.symbol, height: currentSize.symbol }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={symbolSrc}
              alt="Arvanta Studio Symbol"
              width={currentSize.symbol}
              height={currentSize.symbol}
              decoding="async"
              className="w-full h-full object-contain"
              style={{
                imageRendering: "crisp-edges",
                filter: isLight ? "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" : "none",
              }}
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span
              className={`font-display font-black tracking-tight uppercase ${currentSize.text} ${
                isLight ? "text-warm-ivory" : "text-deep-charcoal"
              }`}
            >
              ARVANTA<span className="text-muted-olive font-serif">.</span>STUDIO
            </span>
            {withTagline && (
              <span
                className={`font-mono tracking-widest uppercase mt-0.5 ${currentSize.sub} ${
                  isLight ? "text-warm-ivory/60" : "text-deep-charcoal/60"
                }`}
              >
                Digital Solutions
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
