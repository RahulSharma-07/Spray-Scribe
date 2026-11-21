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

export async function deleteContent(id: string) {
  await verifyAdmin();
  await prisma.generatedContent.delete({
    where: { id }
  });
  revalidatePath("/admin/content");
}
