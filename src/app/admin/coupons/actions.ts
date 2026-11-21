"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  discountType: "percent" | "flat_credits";
  discountValue: number;
  maxUses?: number;
  expiresAt?: string;
}) {
  await verifyAdmin();
  if (!data.code.trim()) throw new Error("Code is required");
  if (data.discountValue <= 0) throw new Error("Discount value must be greater than 0");
  if (data.discountType === "percent" && data.discountValue > 100) throw new Error("Percent cannot exceed 100");

  const code = data.code.trim().toUpperCase();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) throw new Error("Coupon code already exists");

  await prisma.coupon.create({
    data: {
      code,
      description: data.description?.trim() ?? null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: true,
    },
  });
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await verifyAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await verifyAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
