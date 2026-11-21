import { prisma } from "@/lib/prisma";
import PromptClient from "./PromptClient";

export const dynamic = 'force-dynamic';

export default async function PromptsPage() {
  const prompts = await prisma.prompt.findMany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Prompt Engine</h1>
        <p className="text-gray-400 mt-2">Manage backend core AI Prompts mapped to each platform tool.</p>
      </div>

      <PromptClient initialPrompts={prompts} />
    </div>
  );
}
