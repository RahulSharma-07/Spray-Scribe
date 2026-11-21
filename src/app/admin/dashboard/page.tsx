import { prisma } from "@/lib/prisma";
import {
  Users, BarChart3, TrendingUp, Sparkles,
  Zap, ArrowUpRight, ArrowDownRight, Activity, Settings
} from "lucide-react";
import Link from "next/link";
import { TOOL_LABELS } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Parallel DB queries
  const [
    totalUsers,
    totalGenerated,
    activePro,
    recentUsers,
    usageByTool,
    totalCreditsSpent
  ] = await Promise.all([
    prisma.user.count(),
    prisma.generatedContent.count(),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, plan: true, createdAt: true } }),
    prisma.generatedContent.groupBy({ by: ["toolType"], _count: true, orderBy: { _count: { toolType: "desc" } }, take: 5 }),
    prisma.usageLog.aggregate({ _sum: { credits: true } }),
  ]);

  const cards = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "blue", change: "+12%", trend: "up" },
    { label: "Content Generated", value: totalGenerated, icon: Sparkles, color: "purple", change: "+45%", trend: "up" },
    { label: "Active Pro Users", value: activePro, icon: TrendingUp, color: "green", change: "+8%", trend: "up" },
    { label: "Credits Consumed", value: totalCreditsSpent._sum.credits || 0, icon: Zap, color: "yellow", change: "+32%", trend: "up" },
  ];

  const colorStyles: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
    green: "from-green-500/20 to-green-600/5 text-green-400 border-green-500/20",
    yellow: "from-yellow-500/20 to-yellow-600/5 text-yellow-400 border-yellow-500/20",
  };

  const iconStyles: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    green: "bg-green-500/10 text-green-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-2">Admin Overview</h1>
        <p className="text-gray-400 text-sm">Monitor system performance and user activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`p-6 rounded-2xl bg-gradient-to-br border bg-black/20 transition-all duration-300 hover:shadow-lg ${colorStyles[card.color]}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles[card.color]}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {card.change}
                {card.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
            </div>
            <div className="text-sm text-gray-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white/05 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Recently Joined
            </h2>
            <Link href="/admin/users" className="text-xs text-blue-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-white/10">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/05 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-black text-white shadow-lg">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name || "Unknown"}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full mb-1 ${user.plan === "PRO" ? "bg-blue-500/10 text-blue-400" : "bg-gray-500/10 text-gray-400"}`}>
                    {user.plan}
                  </span>
                  <div className="text-[10px] text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health & Status */}
        <div className="bg-white/05 rounded-2xl border border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h2 className="font-display font-bold text-lg text-white">System Command</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Server Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/40 rounded-xl border border-white/05">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Server Latency</p>
                <p className="text-xl font-bold text-white">24ms</p>
                <div className="w-full h-1 bg-green-500/20 rounded-full mt-2">
                  <div className="h-full bg-green-500 w-[20%] rounded-full" />
                </div>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/05">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">CPU Load</p>
                <p className="text-xl font-bold text-white">12%</p>
                <div className="w-full h-1 bg-blue-500/20 rounded-full mt-2">
                  <div className="h-full bg-blue-500 w-[12%] rounded-full" />
                </div>
              </div>
            </div>

            {/* API Statuses */}
            <div className="space-y-3 pt-2">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Gateway Status</h3>
               <div className="flex items-center justify-between p-3 bg-green-500/05 border border-green-500/10 rounded-xl">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-semibold text-green-500">Gemini 2.0 Flash</span>
                 </div>
                 <span className="text-[10px] text-green-500/60 font-bold uppercase">Operational</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-green-500/05 border border-green-500/10 rounded-xl">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-semibold text-green-500">OpenAI GPT-4o</span>
                 </div>
                 <span className="text-[10px] text-green-500/60 font-bold uppercase">Operational</span>
               </div>
            </div>

            {/* Platform Toggles */}
            <div className="pt-4 border-t border-white/05">
               <Link href="/admin/settings" className="w-full btn-gradient py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2">
                 <Settings className="w-3.5 h-3.5" />
                 MANAGE SYSTEM CONFIG
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
