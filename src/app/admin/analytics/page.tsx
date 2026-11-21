import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [userCountByPlan, totalCreditsUsed, recentUsers] = await Promise.all([
    prisma.user.groupBy({
      by: ['plan'],
      _count: true
    }),
    prisma.usageLog.aggregate({ _sum: { credits: true } }),
    prisma.user.findMany({ 
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { id: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Platform Analytics</h1>
        <p className="text-gray-400 mt-2">Deep dive into user growth, revenue, and retention metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/05 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400 font-medium font-display">User Growth (30d)</h3>
          </div>
          <div className="text-4xl font-bold text-white mt-4">{recentUsers.length}</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> New signups this month
          </div>
        </div>

        <div className="bg-white/05 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-gray-400 font-medium font-display">Subscribers by Plan</h3>
          </div>
          <div className="mt-4 space-y-3">
            {userCountByPlan.map((data) => (
              <div key={data.plan} className="flex justify-between text-sm">
                <span className="text-gray-300">{data.plan}</span>
                <span className="text-white font-bold">{data._count} counts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/05 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <h3 className="text-gray-400 font-medium font-display">Total Credits Consumed</h3>
          </div>
          <div className="text-4xl font-bold text-white mt-4">
            {totalCreditsUsed._sum.credits || 0}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Overall AI generation tokens used
          </div>
        </div>
      </div>
      
      <div className="bg-white/05 border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center h-64 text-center">
         <BarChart3 className="w-16 h-16 text-gray-600 mb-4" />
         <h3 className="text-white text-lg font-bold">More Advanced Charts Coming Soon</h3>
         <p className="text-gray-500 text-sm max-w-md mt-2">
           Detailed time-series revenue graphs and daily active user tracking will be placed here utilizing the real-time Stripe/Razorpay webhooks.
         </p>
      </div>

    </div>
  );
}
