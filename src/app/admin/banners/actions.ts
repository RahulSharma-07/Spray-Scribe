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

export async function createBanner(data: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
}) {
  await verifyAdmin();
  await prisma.banner.create({ data });
  revalidatePath("/admin/banners");
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  await verifyAdmin();
  await prisma.banner.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  await verifyAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
}
