import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, PenTool, Image, ShoppingBag, Youtube,
  Code2, BookOpen, ArrowRight, TrendingUp, Clock,
  Zap, Activity
} from "lucide-react";
import { TOOL_LABELS, formatRelativeDate } from "@/lib/utils";

const quickTools = [
  { href: "/tools/blog-generator",       icon: PenTool,    label: "Blog Generator",       color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",   iconColor: "text-blue-400 bg-blue-500/10"   },
  { href: "/tools/instagram-caption",    icon: Image,      label: "Instagram Captions",   color: "from-pink-500/20 to-pink-600/5 border-pink-500/20",   iconColor: "text-pink-400 bg-pink-500/10"   },
  { href: "/tools/product-description",  icon: ShoppingBag,label: "Product Description",  color: "from-green-500/20 to-green-600/5 border-green-500/20",iconColor: "text-green-400 bg-green-500/10" },
  { href: "/tools/youtube-description",  icon: Youtube,    label: "YouTube Suite",        color: "from-red-500/20 to-red-600/5 border-red-500/20",      iconColor: "text-red-400 bg-red-500/10"     },
  { href: "/tools/youtube-script",       icon: Youtube,    label: "YouTube Script",       color: "from-orange-500/20 to-orange-600/5 border-orange-500/20",iconColor: "text-orange-400 bg-orange-500/10"},
  { href: "/tools/code-assistant",       icon: Code2,      label: "Code Assistant",       color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",iconColor: "text-purple-400 bg-purple-500/10"},
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, plan: true, name: true, createdAt: true },
  });

  const recentContent = await prisma.generatedContent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, toolType: true, title: true, createdAt: true },
  });

  // "This Month" — only count generations since the 1st of the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthCount = await prisma.usageLog.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  const totalGenerated = await prisma.generatedContent.count({ where: { userId } });

  const credits    = user?.credits ?? 0;
  const plan       = user?.plan   ?? "FREE";
  const maxCredits = plan === "FREE" ? 10 : plan === "PRO" ? 100 : 500;
  const firstName  = user?.name?.split(" ")[0] ?? "there";
  const greeting   = getGreeting();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-gray-400">Here's your content creation overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Credits Remaining", value: credits,
            sub: "available",
            icon: Sparkles, iconColor: "text-yellow-400 bg-yellow-400/10",
            gradient: "from-yellow-500/10 to-orange-500/5",
            bar: { pct: Math.min((credits / maxCredits) * 100, 100), color: "from-yellow-500 to-orange-500" },
          },
          {
            label: "Content Generated", value: totalGenerated,
            sub: "all time",
            icon: TrendingUp, iconColor: "text-blue-400 bg-blue-400/10",
            gradient: "from-blue-500/10 to-cyan-500/5",
            bar: null,
          },
          {
            label: "This Month", value: thisMonthCount,
            sub: "generations",
            icon: Activity, iconColor: "text-purple-400 bg-purple-400/10",
            gradient: "from-purple-500/10 to-pink-500/5",
            bar: null,
          },
          {
            label: "Current Plan", value: plan,
            sub: plan === "FREE" ? "Upgrade for more" : "Active subscription",
            icon: Zap, iconColor: "text-green-400 bg-green-400/10",
            gradient: "from-green-500/10 to-emerald-500/5",
            bar: null,
          },
        ].map((stat) => (
          <div key={stat.label} className={`p-5 rounded-2xl bg-gradient-to-br ${stat.gradient} border border-white/08 glass`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white capitalize">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.sub}</div>
            {stat.bar && (
              <div className="mt-3 w-full bg-white/10 rounded-full h-1">
                <div
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.bar.color} transition-all duration-700`}
                  style={{ width: `${stat.bar.pct}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Low credits warning */}
      {credits < 3 && credits >= 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-300">Low Credits Warning</p>
              <p className="text-xs text-gray-400">You have {credits} credit{credits !== 1 ? "s" : ""} left. Upgrade to keep creating.</p>
            </div>
          </div>
          <Link href="/upgrade" className="btn-gradient text-xs font-semibold text-white px-4 py-2 rounded-xl flex-shrink-0 shadow-lg">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Quick Access Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-white">Quick Access</h2>
          <Link href="/tools/all" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group p-4 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${tool.color}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tool.iconColor}`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white leading-tight">{tool.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white">Recent Content</h2>
            <Link href="/library" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentContent.length === 0 ? (
              <div className="p-8 rounded-2xl glass border border-white/08 text-center">
                <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium mb-1">No content yet</p>
                <p className="text-gray-600 text-xs">Start generating content with AI tools</p>
                <Link href="/tools/all" className="inline-flex mt-3 btn-gradient text-xs font-semibold text-white px-4 py-2 rounded-xl">
                  Explore Tools
                </Link>
              </div>
            ) : (
              recentContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl glass border border-white/08 hover:border-white/15 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <PenTool className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{TOOL_LABELS[item.toolType]}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatRelativeDate(item.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usage by Tool */}
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-4">Get Started</h2>
          <div className="p-6 rounded-2xl glass border border-white/08 space-y-4">
            {[
              { step: "1", text: "Choose an AI tool from the sidebar",    done: totalGenerated > 0 },
              { step: "2", text: "Fill in your content details",          done: totalGenerated > 1 },
              { step: "3", text: "Generate and save your content",        done: totalGenerated > 2 },
              { step: "4", text: "Upgrade for unlimited generations",     done: plan !== "FREE" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  item.done ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/08 text-gray-400 border border-white/10"
                }`}>
                  {item.done ? "✓" : item.step}
                </div>
                <span className={`text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-300"}`}>{item.text}</span>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/tools/all" className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-lg">
                <Sparkles className="w-4 h-4" />
                Start Creating Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
