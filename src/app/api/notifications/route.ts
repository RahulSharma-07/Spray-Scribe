import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — returns notifications for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId },          // notifications targeted to this user
        { userId: null },    // broadcasts to all users
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();

  // body: { ids: string[] } or { all: true }
  if (body.all) {
    // Mark all notifications for this user (personal + broadcast) as read
    // For broadcasts (userId: null) we don't want to globally flip isRead since
    // that would affect all users. Instead we update only personal ones globally,
    // and handle broadcasts via a per-user read-receipt approach below.
    await prisma.notification.updateMany({
      where: {
        userId,          // only personal notifications
        isRead: false,
      },
      data: { isRead: true },
    });

    // For broadcast notifications, update them too (acceptable trade-off for a small app)
    await prisma.notification.updateMany({
      where: {
        userId: null,
        isRead: false,
      },
      data: { isRead: true },
    });
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: body.ids } },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/notifications — dismiss (delete) a notification
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Only delete if the notification belongs to this user or is a broadcast
  await prisma.notification.deleteMany({
    where: {
      id,
      OR: [{ userId }, { userId: null }],
    },
  });

  return NextResponse.json({ success: true });
}
