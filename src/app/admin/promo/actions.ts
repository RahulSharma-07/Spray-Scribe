"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");
}

export async function createPromoBanner(data: {
  message: string;
  linkText?: string;
  linkHref?: string;
  color: string;
  expiresAt?: string;
}) {
  await verifyAdmin();
  if (!data.message.trim()) throw new Error("Message is required");
  await prisma.promoBanner.create({
    data: {
      message: data.message.trim(),
      linkText: data.linkText?.trim() ?? null,
      linkHref: data.linkHref?.trim() ?? null,
      color: data.color,
      isActive: false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/promo");
}

export async function activatePromoBanner(id: string) {
  await verifyAdmin();
  // Deactivate all, then activate the selected one
  await prisma.promoBanner.updateMany({ data: { isActive: false } });
  await prisma.promoBanner.update({ where: { id }, data: { isActive: true } });
  revalidatePath("/admin/promo");
}

export async function deactivatePromoBanner(id: string) {
  await verifyAdmin();
  await prisma.promoBanner.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/admin/promo");
}

export async function deletePromoBanner(id: string) {
  await verifyAdmin();
  await prisma.promoBanner.delete({ where: { id } });
  revalidatePath("/admin/promo");
}
