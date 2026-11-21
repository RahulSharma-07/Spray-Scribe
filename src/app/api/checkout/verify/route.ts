import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId    = (session.user as any).id as string;
  const userEmail = session.user.email!;

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan: planKey,
    couponId,
    finalPrice,
    totalCredits,
  } = await req.json();

  // ── 1. Verify signature ──────────────────────────────────────────────────
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed. Invalid signature." }, { status: 400 });
  }

  // ── 2. Validate plan ─────────────────────────────────────────────────────
  if (!["pro", "enterprise"].includes(planKey))
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const planEnum = planKey === "pro" ? "PRO" : "ENTERPRISE";

  // ── 3. Look up user ───────────────────────────────────────────────────────
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const dbUserId = user.id;

  // ── 4. Upgrade plan + credits + subscription + coupon ────────────────────
  await prisma.$transaction(async (tx) => {
    // Upgrade user
    await tx.user.update({
      where: { id: dbUserId },
      data:  { plan: planEnum, credits: { increment: totalCredits } },
    });

    // Record transaction with Razorpay payment ID
    await tx.transaction.create({
      data: {
        userId:            dbUserId,
        amount:            finalPrice,
        currency:          "INR",
        status:            "paid",
        type:              "subscription",
        paymentMethod:     "razorpay",
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    // Upsert subscription
    const existingSub = await tx.subscription.findFirst({ where: { userId: dbUserId } });
    if (existingSub) {
      await tx.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan:              planEnum,
          status:            "active",
          razorpaySubId:     razorpay_payment_id,
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
          razorpaySubId:     razorpay_payment_id,
          currentPeriodStart: new Date(),
          currentPeriodEnd:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Coupon redemption
    if (couponId) {
      const existing = await tx.couponRedemption.findUnique({
        where: { couponId_userId: { couponId, userId: dbUserId } },
      });
      if (!existing) {
        await tx.couponRedemption.create({ data: { couponId, userId: dbUserId } });
        await tx.coupon.update({
          where: { id: couponId },
          data:  { usedCount: { increment: 1 } },
        });
      }
    }

    // Activity log
    await tx.activityLog.create({
      data: {
        userId:  dbUserId,
        action:  "PLAN_UPGRADE",
        details: `Upgraded to ${planEnum} · ₹${finalPrice} paid via Razorpay (${razorpay_payment_id})${couponId ? " · coupon applied" : ""}`,
      },
    });
  });

  const updated = await prisma.user.findUnique({
    where:  { id: dbUserId },
    select: { credits: true, plan: true },
  });

  return NextResponse.json({ success: true, credits: updated?.credits, plan: updated?.plan });
}
