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
    const userId = searchParams.get("userId") || "";
    const action = searchParams.get("action") || "";
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: userId ? {} : {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    const actions = await prisma.activityLog.groupBy({
      by: ["action"],
      _count: true,
    });

    return NextResponse.json({ logs, total, actions });
  } catch (error) {
    console.error("Admin Logs GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { userId, action, details, ipAddress, userAgent } = body;

    await prisma.activityLog.create({
      data: {
        userId: userId || (session?.user as any)?.id || null,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Logs POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}