import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = (session.user as any).email;

    // Look up by ID first, fall back to email (handles session/DB mismatch after migration)
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, plan: true, role: true },
    });
    if (!user && userEmail) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { credits: true, plan: true, role: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ credits: user.credits, plan: user.plan, role: user.role });
  } catch (error) {
    console.error("Credits fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
