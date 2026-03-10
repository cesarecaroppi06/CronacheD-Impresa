"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/lib/site";

type BrandLogoProps = {
  size?: "sm" | "md";
  showSubtitle?: boolean;
};

export function BrandLogo({ size = "sm", showSubtitle = false }: BrandLogoProps) {
  const iconSize = size === "md" ? "h-14 w-14" : "h-11 w-11";
  const ringInset = size === "md" ? "inset-[4px]" : "inset-[3px]";
  const [logoSrc, setLogoSrc] = useState(siteConfig.brandLogoPath);

  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span
        className={`relative ${iconSize} shrink-0 rounded-full shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-transform duration-300 group-hover:scale-[1.03]`}
      >
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_160deg,_#1e3a8a,_#0f172a,_#334155,_#1e3a8a)]" />
        <span className={`absolute ${ringInset} overflow-hidden rounded-full border border-white/80 bg-white`}>
          <Image
            src={logoSrc}
            alt={siteConfig.brandLogoAlt}
            fill
            className="object-cover"
            sizes={size === "md" ? "56px" : "44px"}
            priority
            onError={() => {
              if (logoSrc !== siteConfig.brandLogoFallbackPath) {
                setLogoSrc(siteConfig.brandLogoFallbackPath);
              }
            }}
          />
        </span>
      </span>

      <span className="leading-tight">
        <span className="block font-serif text-lg font-semibold tracking-tight text-ink sm:text-xl">
          {siteConfig.name}
        </span>
        {showSubtitle ? (
          <span className="mt-0.5 block text-xs uppercase tracking-[0.16em] text-slate-500">
            Media & Business Journal
          </span>
        ) : null}
      </span>
    </Link>
  );
}
