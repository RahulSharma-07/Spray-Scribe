import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import groq from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email!;
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // Look up user by ID first, fall back to email (handles session/DB mismatch after migration)
    let user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, credits: true } });
    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true, credits: true } });
    }
    if (!user) {
      return NextResponse.json({ error: "User not found. Please log out and log in again." }, { status: 404 });
    }
    if (user.credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    const dbUserId = user.id;

    // Build messages for Groq
    const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
      {
        role: "system",
        content: `You are a helpful, professional AI assistant. Always format your responses using markdown:
- Use **bold** for important terms
- Use ## headings to organize sections
- Use bullet points (- item) for lists
- Use numbered lists (1. item) for steps
- Use \`code\` for inline code and \`\`\`language blocks for multi-line code
- Use > for quotes or tips
- Keep responses well-structured and easy to read`,
      },
      ...(history ?? []).map((m: any) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
      messages,
      max_tokens: 1500,
    });
    const output = completion.choices[0]?.message?.content ?? "";

    // Deduct 1 credit & log usage
    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbUserId },
        data: { credits: { decrement: 1 } },
      }),
      prisma.usageLog.create({
        data: { userId: dbUserId, toolType: "AI_CHAT", credits: 1 },
      }),
    ]);

    return NextResponse.json({
      success: true,
      output,
      creditsRemaining: user.credits - 1,
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
