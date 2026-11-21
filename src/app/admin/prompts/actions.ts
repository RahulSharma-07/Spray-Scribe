"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ToolType } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function upsertPrompt(data: {
  toolType: ToolType;
  name: string;
  description?: string;
  template: string;
  variables: string;
}) {
  await verifyAdmin();
  let varsJson = "[]";
  try {
    varsJson = JSON.parse(data.variables);
  } catch (e) {
    throw new Error("Invalid variables JSON");
  }

  await prisma.prompt.upsert({
    where: { toolType: data.toolType },
    update: {
      name: data.name,
      description: data.description,
      template: data.template,
      variables: varsJson,
    },
    create: {
      toolType: data.toolType,
      name: data.name,
      description: data.description,
      template: data.template,
      variables: varsJson,
    }
  });
  revalidatePath("/admin/prompts");
}

export async function togglePromptStatus(id: string, isActive: boolean) {
  await verifyAdmin();
  await prisma.prompt.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/prompts");
}
