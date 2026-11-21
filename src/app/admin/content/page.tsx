import { prisma } from "@/lib/prisma";
import ContentTable from "./ContentTable";

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const content = await prisma.generatedContent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to 100 recent for performance
    include: {
      user: { select: { email: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Content Monitoring</h1>
        <p className="text-gray-400 mt-2">Monitor and manage AI generated content across the platform. (Showing last 100)</p>
      </div>

      <ContentTable initialContent={content} />
    </div>
  );
}
