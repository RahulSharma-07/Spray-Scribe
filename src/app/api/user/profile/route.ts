import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getDbUser(session: any) {
  const userId = (session.user as any).id;
  const userEmail = session.user?.email;

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user && userEmail) {
    user = await prisma.user.findUnique({ where: { email: userEmail } });
  }
  return user;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getDbUser(session);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Find the real DB user (handles session/DB ID mismatch)
    const existingUser = await getDbUser(session);
    if (!existingUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
