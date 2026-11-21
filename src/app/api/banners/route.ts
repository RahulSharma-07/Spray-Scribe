import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/banners — fetch active banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, banners });
  } catch {
    // Return demo banners if DB not set up
    return NextResponse.json({
      success: true,
      banners: [
        { id: "1", title: "Welcome to Spray Scribe", subtitle: "AI-powered content creation", imageUrl: "", ctaText: "Get Started", ctaLink: "/signup", isActive: true, order: 0 },
      ],
    });
  }
}
