import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [transactions, total, stats] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({ 
      transactions, 
      total,
      totalRevenue: stats._sum.amount || 0
    });
  } catch (error) {
    console.error("Admin Transactions GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error("Admin Transactions PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}