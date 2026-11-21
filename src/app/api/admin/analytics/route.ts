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
    const period = searchParams.get("period") || "30"; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      totalUsers,
      totalRevenue,
      activeSubscriptions,
      totalContent,
      creditsSpent,
      recentUsers,
      userGrowth,
      revenueByDay,
      contentByTool,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.generatedContent.count(),
      prisma.usageLog.aggregate({ _sum: { credits: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, plan: true, createdAt: true },
      }),
      prisma.$queryRaw`
        SELECT date(createdAt) as date, COUNT(*) as count 
        FROM users 
        WHERE createdAt >= ${startDate}
        GROUP BY date(createdAt)
        ORDER BY date
      ` as Promise<{ date: Date; count: bigint }[]>,
      prisma.$queryRaw`
        SELECT date(createdAt) as date, SUM(amount) as total
        FROM transactions
        WHERE status = 'completed' AND createdAt >= ${startDate}
        GROUP BY date(createdAt)
        ORDER BY date
      ` as Promise<{ date: Date; total: number }[]>,
      prisma.generatedContent.groupBy({
        by: ["toolType"],
        _count: true,
        orderBy: { _count: { toolType: "desc" } },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscriptions,
        totalContent,
        creditsSpent: creditsSpent._sum.credits || 0,
      },
      userGrowth: userGrowth.map((d: any) => ({
        date: d.date instanceof Date ? d.date.toISOString().split("T")[0] : String(d.date),
        count: Number(d.count),
      })),
      revenueByDay: revenueByDay.map((d: any) => ({
        date: d.date instanceof Date ? d.date.toISOString().split("T")[0] : String(d.date),
        total: d.total || 0,
      })),
      contentByTool: contentByTool.map((d: any) => ({
        tool: d.toolType,
        count: d._count,
      })),
      recentUsers,
    });
  } catch (error) {
    console.error("Admin Analytics GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}