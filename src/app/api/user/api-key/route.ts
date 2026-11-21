import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    const apiKey = crypto.randomUUID();
    await prisma.user.update({ where: { id: userId }, data: { apiKey } });
    return NextResponse.json({ success: true, apiKey });
  } catch {
    return NextResponse.json({ error: "Failed to regenerate API key" }, { status: 500 });
  }
}
