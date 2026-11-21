import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get("toolType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (toolType && toolType !== "ALL") where.toolType = toolType;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [items, total] = await Promise.all([
      prisma.generatedContent.findMany({
        where, orderBy: { createdAt: "desc" }, skip, take: limit,
        select: { id: true, toolType: true, title: true, output: true, createdAt: true, updatedAt: true },
      }),
      prisma.generatedContent.count({ where }),
    ]);

    return NextResponse.json({ success: true, items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing content ID" }, { status: 400 });

    const item = await prisma.generatedContent.findFirst({ where: { id, userId } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.generatedContent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
