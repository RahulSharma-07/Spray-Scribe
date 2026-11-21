import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const userEmail = session.user?.email;
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    // Look up by ID first, fall back to email
    let user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, password: true } });
    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true, password: true } });
    }

    if (!user?.password)
      return NextResponse.json({ error: "No password set on this account (use Google login)" }, { status: 400 });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
