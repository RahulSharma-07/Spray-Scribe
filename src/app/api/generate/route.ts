import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import groq from "@/lib/gemini";
import {
  BLOG_PROMPT, INSTAGRAM_CAPTION_PROMPT, PRODUCT_DESCRIPTION_PROMPT,
  YOUTUBE_DESCRIPTION_PROMPT, YOUTUBE_SCRIPT_PROMPT, CODE_ASSISTANT_PROMPT
} from "@/lib/prompts";
import { TOOL_CREDITS } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email!;
    const body = await req.json();
    const { toolType, input } = body;

    if (!toolType || !input) {
      return NextResponse.json({ error: "Missing toolType or input" }, { status: 400 });
    }

    // Look up user by ID first, fall back to email if not found (handles session/DB mismatch)
    let user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, credits: true } });
    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true, credits: true } });
    }
    const creditsNeeded = TOOL_CREDITS[toolType] ?? 1;

    if (!user) {
      return NextResponse.json({ error: "User not found. Please log out and log in again." }, { status: 404 });
    }

    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        { error: `Insufficient credits. You have ${user.credits} but need ${creditsNeeded}.` },
        { status: 402 }
      );
    }

    // Use the real DB user ID for all subsequent operations
    const dbUserId = user.id;

    // Build prompt
    let prompt = "";
    let title = "";

    switch (toolType) {
      case "BLOG_GENERATOR":
        prompt = BLOG_PROMPT(input.topic, input.tone, input.length, input.language);
        title = `Blog: ${input.topic}`;
        break;
      case "INSTAGRAM_CAPTION":
        prompt = INSTAGRAM_CAPTION_PROMPT(input.topic, input.tone, input.audience, input.count);
        title = `Caption: ${input.topic}`;
        break;
      case "PRODUCT_DESCRIPTION":
        prompt = PRODUCT_DESCRIPTION_PROMPT(input.productName, input.features, input.audience, input.tone);
        title = `Product: ${input.productName}`;
        break;
      case "YOUTUBE_DESCRIPTION":
        prompt = YOUTUBE_DESCRIPTION_PROMPT(input.title, input.topic, input.audience, input.tone, input.descLength as string);
        title = `YouTube: ${input.title}`;
        break;
      case "YOUTUBE_SCRIPT":
        prompt = YOUTUBE_SCRIPT_PROMPT(input.title, input.topic, input.videoType, input.tone, input.length);
        title = `Script: ${input.title}`;
        break;
      case "CODE_ASSISTANT":
        prompt = CODE_ASSISTANT_PROMPT(input.problem, input.language, input.complexity);
        title = `Code: ${input.problem.slice(0, 50)}`;
        break;
      default:
        return NextResponse.json({ error: "Invalid tool type" }, { status: 400 });
    }

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: toolType === "YOUTUBE_DESCRIPTION"
        ? (input.descLength === "short" ? 2000 : input.descLength === "detailed" ? 6000 : 3500)
        : 2048,
    });
    let output = completion.choices[0]?.message?.content ?? "";

    // For YouTube descriptions, enforce the description body word limit server-side.
    // The model often ignores prompt-level word caps, so we trim Section 2 here.
    if (toolType === "YOUTUBE_DESCRIPTION") {
      const maxWords =
        input.descLength === "short"    ? 240 :
        input.descLength === "detailed" ? 750 :
                                          450; // standard

      // Find Section 2 start and end markers
      const sec2Start = output.search(/SECTION 2[^\n]*\n/i);
      const sec2HeaderMatch = output.match(/SECTION 2[^\n]*\n/i);
      const sec3Start = output.search(/SECTION 3/i);

      if (sec2Start !== -1 && sec2HeaderMatch && sec3Start !== -1) {
        const headerEnd = sec2Start + sec2HeaderMatch[0].length;
        const bodyText  = output.slice(headerEnd, sec3Start);
        const words     = bodyText.split(/(\s+)/); // split preserving whitespace tokens
        const wordTokens = bodyText.match(/\S+/g) ?? [];

        if (wordTokens.length > maxWords) {
          // Rebuild body with exactly maxWords words
          let count = 0;
          let truncated = "";
          for (const token of words) {
            if (/\S/.test(token)) {
              if (count >= maxWords) break;
              count++;
            }
            truncated += token;
          }
          // Trim trailing incomplete sentence and add ellipsis
          truncated = truncated.trimEnd();
          if (!truncated.endsWith(".") && !truncated.endsWith("!") && !truncated.endsWith("?")) {
            const lastPeriod = Math.max(
              truncated.lastIndexOf("."),
              truncated.lastIndexOf("!"),
              truncated.lastIndexOf("?")
            );
            if (lastPeriod > truncated.length * 0.7) {
              truncated = truncated.slice(0, lastPeriod + 1);
            }
          }
          output = output.slice(0, headerEnd) + truncated + "\n\n" + output.slice(sec3Start);
        }
      }
    }

    // Deduct credits & log usage (atomic-ish)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbUserId },
        data: { credits: { decrement: creditsNeeded } },
      }),
      prisma.usageLog.create({
        data: { userId: dbUserId, toolType, credits: creditsNeeded },
      }),
    ]);

    // Save content to library
    const content = await prisma.generatedContent.create({
      data: { userId: dbUserId, toolType, title, input, output, isSaved: true },
    });

    return NextResponse.json({
      success: true,
      output,
      contentId: content.id,
      creditsUsed: creditsNeeded,
      creditsRemaining: user.credits - creditsNeeded,
    });

  } catch (error: any) {
    console.error("Generate error:", error);
    if (error?.code === "insufficient_quota" || error?.status === 429) {
      return NextResponse.json({ error: "AI service quota exceeded. Please try again later." }, { status: 503 });
    }
    if (error?.status === 401 || error?.status === 403) {
      return NextResponse.json({ error: "Invalid API key. Please contact admin." }, { status: 503 });
    }
    return NextResponse.json({ error: `Failed to generate content: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
