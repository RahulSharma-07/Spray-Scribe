import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Admin Banners GET Error:", error);
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
    const { title, subtitle, ctaText, ctaLink, imageUrl, isActive, order } = body;

    const maxOrder = await prisma.banner.aggregate({
      _max: { order: true },
    });

    const newBanner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || "",
        ctaText: ctaText || "Get Started",
        ctaLink: ctaLink || "/signup",
        imageUrl: imageUrl || "",
        isActive: isActive ?? true,
        order: order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });

    return NextResponse.json({ banner: newBanner });
  } catch (error) {
    console.error("Admin Banners POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}