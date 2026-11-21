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

export async function updateUserCredits(userId: string, credits: number) {
  await verifyAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { credits },
  });
  revalidatePath("/admin/users");
}

export async function updateUserPlan(userId: string, plan: "FREE" | "PRO" | "ENTERPRISE") {
  await verifyAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { plan },
  });
  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
  await verifyAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await verifyAdmin();
  await prisma.user.delete({
    where: { id: userId },
  });
  revalidatePath("/admin/users");
}

export async function giftCredits(userId: string, amount: number, reason?: string) {
  await verifyAdmin();
  if (amount <= 0) throw new Error("Gift amount must be positive");
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
  // Log it as an activity
  await prisma.activityLog.create({
    data: {
      userId,
      action: "CREDIT_GIFT",
      details: `Admin gifted ${amount} credits${reason ? ` — ${reason}` : ""}`,
    },
  });
  revalidatePath("/admin/users");
}
