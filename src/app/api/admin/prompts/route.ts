import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prompts = await prisma.prompt.findMany({
      orderBy: { toolType: "asc" },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Admin Prompts GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { toolType, name, description, template, variables, isActive } = body;

    const prompt = await prisma.prompt.create({
      data: {
        toolType,
        name,
        description,
        template,
        variables,
        isActive,
      },
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Admin Prompts POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, toolType, name, description, template, variables, isActive } = body;

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        toolType,
        name,
        description,
        template,
        variables,
        isActive,
      },
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Admin Prompts PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}