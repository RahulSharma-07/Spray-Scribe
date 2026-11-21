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

export async function updateSystemSettings(data: any) {
  await verifyAdmin();
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data }
  });
  revalidatePath("/admin/settings");
}
