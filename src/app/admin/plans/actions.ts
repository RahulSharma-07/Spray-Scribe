"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Plan } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function upsertPricingPlan(data: {
  plan: Plan;
  name: string;
  price: number;
  credits: number;
  features: string;
  isPopular?: boolean;
}) {
  await verifyAdmin();
  let featuresJson = "[]";
  try {
    featuresJson = JSON.parse(data.features);
  } catch (e) {
    throw new Error("Invalid features JSON format. Should be an array of strings.");
  }

  await prisma.pricingPlan.upsert({
    where: { plan: data.plan },
    update: {
      name: data.name,
      price: data.price,
      credits: data.credits,
      features: featuresJson,
      isPopular: data.isPopular || false,
    },
    create: {
      plan: data.plan,
      name: data.name,
      price: data.price,
      credits: data.credits,
      features: featuresJson,
      isPopular: data.isPopular || false,
    }
  });

  revalidatePath("/admin/plans");
}
