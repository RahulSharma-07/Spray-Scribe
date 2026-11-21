import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { code, plan } = await req.json();

  if (!code?.trim()) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { redemptions: { where: { userId } } },
  });

  if (!coupon)           return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!coupon.isActive)  return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  if (coupon.redemptions.length > 0)
    return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
  });
}
