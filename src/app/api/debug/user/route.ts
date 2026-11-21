import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not logged in" });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, credits: true, plan: true, role: true },
  });

  // Also find all users with this email to detect duplicates
  const allByEmail = await prisma.user.findMany({
    where: { email: session.user.email! },
    select: { id: true, email: true, credits: true, plan: true, createdAt: true },
  });

  return NextResponse.json({
    sessionUserId: userId,
    sessionEmail: session.user.email,
    userFromDB: user,
    allUsersWithSameEmail: allByEmail,
  });
}
