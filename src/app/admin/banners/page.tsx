import { prisma } from "@/lib/prisma";
import BannerClient from "./BannerClient";

export const dynamic = 'force-dynamic';

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Banner Management</h1>
        <p className="text-gray-400 mt-2">Manage the hero sliders and banners across the platform.</p>
      </div>

      <BannerClient initialBanners={banners} />
    </div>
  );
}
