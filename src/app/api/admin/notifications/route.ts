import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

// POST /api/admin/notifications — admin sends a notification
// Body: { title, message, type, userId? }
//   userId present  → notification for one specific user
//   userId absent   → broadcast to all users (userId: null in DB)
export async function POST(req: NextRequest) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, message, type = "info", userId } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "title and message are required" }, { status: 400 });
  }

  const validTypes = ["info", "success", "warning", "error"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // If userId is provided, verify that user exists
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  const notification = await prisma.notification.create({
    data: {
      title: title.trim(),
      message: message.trim(),
      type,
      userId: userId ?? null,   // null = broadcast to all
    },
  });

  return NextResponse.json({ notification }, { status: 201 });
}

// GET /api/admin/notifications — list all notifications (for admin view)
export async function GET(req: NextRequest) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take = 20;
  const skip = (page - 1) * take;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.notification.count(),
  ]);

  return NextResponse.json({ notifications, total, page, pageSize: take });
}

// DELETE /api/admin/notifications?id=... — admin deletes a notification
export async function DELETE(req: NextRequest) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
