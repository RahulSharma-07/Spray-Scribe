import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.pricingPlan.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Admin Plans GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, plan, price, credits, features, isPopular, currency } = body;

    const newPlan = await prisma.pricingPlan.create({
      data: {
        name,
        plan,
        price,
        credits,
        features,
        isPopular,
        currency: currency || "USD",
      },
    });

    return NextResponse.json({ plan: newPlan });
  } catch (error) {
    console.error("Admin Plans POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, plan, price, credits, features, isPopular, currency } = body;

    const updatedPlan = await prisma.pricingPlan.update({
      where: { id },
      data: {
        name,
        plan,
        price,
        credits,
        features,
        isPopular,
        currency: currency || "USD",
      },
    });

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error("Admin Plans PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    await prisma.pricingPlan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Plans DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}