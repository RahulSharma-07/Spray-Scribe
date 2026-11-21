import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import razorpay from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json(); // amount in INR (e.g. 50)

  if (!amount || amount <= 0)
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  try {
    const order = await razorpay.orders.create({
      amount:   amount * 100,  // Razorpay uses paise (1 INR = 100 paise)
      currency: "INR",
      receipt:  `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("[Razorpay] create-order error:", err);
    return NextResponse.json(
      { error: err?.error?.description ?? "Failed to create payment order" },
      { status: 500 }
    );
  }
}
