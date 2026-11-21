import { prisma } from "@/lib/prisma";
import PromoClient from "./PromoClient";

export const dynamic = "force-dynamic";

export default async function PromoPage() {
  const banners = await prisma.promoBanner.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">Promo Banners</h1>
        <p className="text-gray-400 text-sm">Create site-wide announcement banners. Only one can be active at a time.</p>
      </div>
      <PromoClient initialBanners={banners} />
    </div>
  );
}
