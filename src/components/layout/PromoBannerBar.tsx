"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: string;
  message: string;
  linkText: string | null;
  linkHref: string | null;
  color: string;
}

const COLOR_MAP: Record<string, string> = {
  teal:  "bg-teal-500/15 border-teal-500/25 text-teal-200",
  amber: "bg-amber-500/15 border-amber-500/25 text-amber-200",
  rose:  "bg-rose-500/15 border-rose-500/25 text-rose-200",
  sky:   "bg-sky-500/15 border-sky-500/25 text-sky-200",
};

export function PromoBannerBar() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/promo-banner")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.banner) setBanner(d.banner); })
      .catch(() => {});
  }, []);

  if (!banner || dismissed) return null;

  const cls = COLOR_MAP[banner.color] ?? COLOR_MAP.teal;

  return (
    <div className={`relative flex items-center justify-center gap-3 px-4 py-2.5 text-xs font-semibold border-b ${cls}`}>
      <span>{banner.message}</span>
      {banner.linkText && banner.linkHref && (
        <Link href={banner.linkHref} className="underline opacity-80 hover:opacity-100 flex-shrink-0">
          {banner.linkText} →
        </Link>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
