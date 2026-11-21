import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.systemSettings.findFirst();
    
    return NextResponse.json({ settings: settings || {} });
  } catch (error) {
    console.error("Admin Settings GET Error:", error);
    return NextResponse.json({ settings: {} });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      appName, appLogo, openaiKey, anthropicKey, 
      rateLimitPerHour, creditCostPerGeneration,
      maintenanceMode, allowSignups, emailNotifications 
    } = body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {
        appName, appLogo, openaiKey, anthropicKey,
        rateLimitPerHour, creditCostPerGeneration,
        maintenanceMode, allowSignups, emailNotifications,
      },
      create: {
        id: "default",
        appName: appName || "Spray Scribe",
        appLogo: appLogo || "",
        openaiKey: openaiKey || "",
        anthropicKey: anthropicKey || "",
        rateLimitPerHour: rateLimitPerHour || 100,
        creditCostPerGeneration: creditCostPerGeneration || 5,
        maintenanceMode: maintenanceMode || false,
        allowSignups: allowSignups !== false,
        emailNotifications: emailNotifications !== false,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin Settings PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}