import { prisma } from "@/lib/prisma";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">Coupon Codes</h1>
        <p className="text-gray-400 text-sm">Create discount codes and bonus credit coupons for campaigns.</p>
      </div>
      <CouponsClient initialCoupons={coupons} />
    </div>
  );
}
