import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

type BrandLogoProps = {
  size?: "sm" | "md";
  showSubtitle?: boolean;
};

export function BrandLogo({ size = "sm", showSubtitle = false }: BrandLogoProps) {
  const iconSize = size === "md" ? "h-14 w-14" : "h-11 w-11";

  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span
        className={`relative ${iconSize} shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.03]`}
      >
        <Image
          src="/images/cd-emblem.svg"
          alt="Logo CD Cronache d'Impresa"
          fill
          className="object-cover"
          sizes={size === "md" ? "56px" : "44px"}
          priority
        />
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
