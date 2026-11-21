import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const updates = await req.json();

    // Specific field validation if needed
    if (updates.role && !["USER", "ADMIN"].includes(updates.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (updates.plan && !["FREE", "PRO", "ENTERPRISE"].includes(updates.plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin User PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
