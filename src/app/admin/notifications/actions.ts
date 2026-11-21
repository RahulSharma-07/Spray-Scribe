"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function sendNotification(data: {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  userId?: string; // omit for broadcast
}) {
  await verifyAdmin();

  if (!data.title.trim() || !data.message.trim()) {
    throw new Error("Title and message are required");
  }

  await prisma.notification.create({
    data: {
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type,
      userId: data.userId ?? null,
    },
  });

  revalidatePath("/admin/notifications");
}

export async function deleteNotification(id: string) {
  await verifyAdmin();
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/admin/notifications");
}

export async function getAdminNotifications(page = 1) {
  await verifyAdmin();

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

  // Enrich broadcast/per-user label — fetch user names for non-null userIds
  const userIds = [...new Set(notifications.map(n => n.userId).filter(Boolean) as string[])];
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const enriched = notifications.map(n => ({
    ...n,
    recipientLabel: n.userId
      ? (userMap[n.userId]?.name ?? userMap[n.userId]?.email ?? n.userId)
      : "All Users",
  }));

  return { notifications: enriched, total, page, pageSize: take };
}

export async function getAllUsers() {
  await verifyAdmin();
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "desc" },
  });
}
