import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId    = (session.user as any).id as string;
  const userEmail = session.user.email!;

  const { plan: planKey, couponId, finalPrice, totalCredits } = await req.json();

  if (!["pro", "enterprise"].includes(planKey))
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const planEnum = planKey === "pro" ? "PRO" : "ENTERPRISE";

  // Look up real user (session ID may be stale)
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const dbUserId = user.id;

  // Run everything atomically
  await prisma.$transaction(async (tx) => {
    // 1. Upgrade plan and add credits
    await tx.user.update({
      where: { id: dbUserId },
      data: {
        plan: planEnum,
        credits: { increment: totalCredits },
      },
    });

    // 2. Record the transaction
    await tx.transaction.create({
      data: {
        userId:   dbUserId,
        amount:   finalPrice,
        currency: "INR",
        status:   "paid",
        type:     "subscription",
        paymentMethod: "manual",
      },
    });

    // 3. Upsert subscription record (find existing one for user, or create new)
    const existingSub = await tx.subscription.findFirst({ where: { userId: dbUserId } });
    if (existingSub) {
      await tx.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan:              planEnum,
          status:            "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          userId:            dbUserId,
          plan:              planEnum,
          status:            "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // 4. Record coupon redemption if one was used
    if (couponId) {
      // Check not already redeemed (race condition guard)
      const existing = await tx.couponRedemption.findUnique({
        where: { couponId_userId: { couponId, userId: dbUserId } },
      });
      if (!existing) {
        await tx.couponRedemption.create({
          data: { couponId, userId: dbUserId },
        });
        await tx.coupon.update({
          where: { id: couponId },
          data:  { usedCount: { increment: 1 } },
        });
      }
    }

    // 5. Activity log
    await tx.activityLog.create({
      data: {
        userId:  dbUserId,
        action:  "PLAN_UPGRADE",
        details: `Upgraded to ${planEnum} · ${totalCredits} credits added · ₹${finalPrice} paid${couponId ? " (coupon applied)" : ""}`,
      },
    });
  });

  // Return fresh credits + plan so the client can display them
  const updated = await prisma.user.findUnique({
    where:  { id: dbUserId },
    select: { credits: true, plan: true },
  });

  return NextResponse.json({
    success: true,
    credits: updated?.credits,
    plan:    updated?.plan,
  });
}
