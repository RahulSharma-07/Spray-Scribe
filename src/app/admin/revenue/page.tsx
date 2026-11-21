import { prisma } from "@/lib/prisma";
import {
  TrendingUp, Users, DollarSign, CreditCard,
  ArrowUpRight, Zap, BarChart3, Activity
} from "lucide-react";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function fmtCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default async function RevenueDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    usersByPlan,
    totalTransactions,
    monthlyRevenue,
    lastMonthRevenue,
    yearlyRevenue,
    totalCreditsGranted,
    creditsThisMonth,
    recentTransactions,
    topSpenders,
    dailySignups,
    couponUsage,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.user.groupBy({ by: ["plan"], _count: true }),
    prisma.transaction.count({ where: { status: { in: ["success", "paid", "completed"] } } }),
    prisma.transaction.aggregate({
      where: { status: { in: ["success", "paid", "completed"] }, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: { in: ["success", "paid", "completed"] }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: { in: ["success", "paid", "completed"] }, createdAt: { gte: startOfYear } },
      _sum: { amount: true },
    }),
    prisma.usageLog.aggregate({ _sum: { credits: true } }),
    prisma.usageLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { credits: true },
    }),
    prisma.transaction.findMany({
      where: { status: { in: ["success", "paid", "completed"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      where: { transactions: { some: { status: { in: ["success", "paid", "completed"] } } } },
      include: {
        _count: { select: { transactions: true } },
        transactions: {
          where: { status: { in: ["success", "paid", "completed"] } },
          select: { amount: true },
        },
      },
      take: 5,
      orderBy: { createdAt: "asc" },
    }),
    // Last 7 days signups
    prisma.$queryRaw`
      SELECT date(createdAt) as day, COUNT(*) as count
      FROM users
      WHERE createdAt >= date('now', '-7 days')
      GROUP BY date(createdAt)
      ORDER BY day ASC
    ` as Promise<{ day: string; count: bigint }[]>,
    prisma.coupon.findMany({
      select: { code: true, usedCount: true, discountType: true, discountValue: true, isActive: true },
      orderBy: { usedCount: "desc" },
      take: 5,
    }),
  ]);

  const mrr = monthlyRevenue._sum.amount ?? 0;
  const lastMrr = lastMonthRevenue._sum.amount ?? 0;
  const arr = mrr * 12;
  const mrrGrowth = lastMrr > 0 ? ((mrr - lastMrr) / lastMrr) * 100 : 0;
  const proUsers = usersByPlan.find(p => p.plan === "PRO")?._count ?? 0;
  const enterpriseUsers = usersByPlan.find(p => p.plan === "ENTERPRISE")?._count ?? 0;
  const freeUsers = usersByPlan.find(p => p.plan === "FREE")?._count ?? 0;
  const paidUsers = proUsers + enterpriseUsers;
  const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : "0";

  const topSpenderData = topSpenders.map(u => ({
    name: u.name ?? u.email ?? "Unknown",
    email: u.email ?? "",
    total: u.transactions.reduce((s, t) => s + t.amount, 0),
    count: u._count.transactions,
    plan: u.plan,
  })).sort((a, b) => b.total - a.total);

  const statCards = [
    {
      label: "MRR (This Month)",
      value: fmtCurrency(mrr),
      sub: mrrGrowth >= 0 ? `+${mrrGrowth.toFixed(1)}% vs last month` : `${mrrGrowth.toFixed(1)}% vs last month`,
      good: mrrGrowth >= 0,
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "ARR (Projected)",
      value: fmtCurrency(arr),
      sub: `${fmtCurrency(yearlyRevenue._sum.amount ?? 0)} earned YTD`,
      good: true,
      icon: TrendingUp,
      color: "teal",
    },
    {
      label: "Paid Users",
      value: fmt(paidUsers),
      sub: `${conversionRate}% conversion · ${fmt(freeUsers)} free`,
      good: true,
      icon: Users,
      color: "sky",
    },
    {
      label: "New Signups (Month)",
      value: fmt(newUsersThisMonth),
      sub: `${fmt(newUsersLastMonth)} last month`,
      good: newUsersThisMonth >= newUsersLastMonth,
      icon: Activity,
      color: "amber",
    },
    {
      label: "Credits Used (Month)",
      value: fmt(creditsThisMonth._sum.credits ?? 0),
      sub: `${fmt(totalCreditsGranted._sum.credits ?? 0)} all-time`,
      good: true,
      icon: Zap,
      color: "orange",
    },
    {
      label: "Transactions",
      value: fmt(totalTransactions),
      sub: "successful payments",
      good: true,
      icon: CreditCard,
      color: "violet",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    teal:    "text-teal-400 bg-teal-500/10 border-teal-500/20",
    sky:     "text-sky-400 bg-sky-500/10 border-sky-500/20",
    amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    orange:  "text-orange-400 bg-orange-500/10 border-orange-500/20",
    violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">Revenue Dashboard</h1>
        <p className="text-gray-400 text-sm">MRR, ARR, conversion, signups — all in one place.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`p-5 rounded-2xl glass border ${colorMap[card.color].split(" ").slice(2).join(" ")}`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-gray-400">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[card.color].split(" ").slice(0, 2).join(" ")}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mb-1">{card.value}</div>
            <div className={`text-xs ${card.good ? "text-gray-500" : "text-red-400"}`}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Plan breakdown + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Plan breakdown */}
        <div className="glass border border-white/08 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" /> Users by Plan
          </h2>
          <div className="space-y-4">
            {[
              { plan: "FREE",       count: freeUsers,       color: "bg-gray-500",    pct: totalUsers > 0 ? (freeUsers / totalUsers) * 100 : 0 },
              { plan: "PRO",        count: proUsers,         color: "bg-teal-500",    pct: totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0 },
              { plan: "ENTERPRISE", count: enterpriseUsers,  color: "bg-amber-500",   pct: totalUsers > 0 ? (enterpriseUsers / totalUsers) * 100 : 0 },
            ].map(row => (
              <div key={row.plan}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-400 font-medium">{row.plan}</span>
                  <span className="text-white font-bold">{fmt(row.count)} <span className="text-gray-600 font-normal text-xs">({row.pct.toFixed(1)}%)</span></span>
                </div>
                <div className="h-1.5 bg-white/08 rounded-full">
                  <div className={`h-1.5 rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/08 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total users</span>
              <span className="text-white font-bold">{fmt(totalUsers)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid users</span>
              <span className="text-teal-400 font-bold">{fmt(paidUsers)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Conversion rate</span>
              <span className="text-amber-400 font-bold">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-2 glass border border-white/08 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/08 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-400" />
            <h2 className="font-bold text-white">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-white/05">
            {recentTransactions.length === 0 ? (
              <div className="p-10 text-center text-gray-600 text-sm">No completed transactions yet</div>
            ) : recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/02 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{tx.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-gray-500">{tx.user?.email} · {tx.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{fmtCurrency(tx.amount)}</p>
                  <p className="text-xs text-gray-600">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top spenders + Coupon performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top spenders */}
        <div className="glass border border-white/08 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/08">
            <h2 className="font-bold text-white">Top Customers</h2>
          </div>
          <div className="divide-y divide-white/05">
            {topSpenderData.length === 0 ? (
              <div className="p-10 text-center text-gray-600 text-sm">No paying customers yet</div>
            ) : topSpenderData.map((u, i) => (
              <div key={u.email} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/02">
                <span className="text-xs text-gray-600 font-bold w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-teal-400">{fmtCurrency(u.total)}</p>
                  <p className="text-xs text-gray-600">{u.count} orders · {u.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon performance */}
        <div className="glass border border-white/08 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/08 flex items-center justify-between">
            <h2 className="font-bold text-white">Top Coupons</h2>
            <a href="/admin/coupons" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Manage →</a>
          </div>
          <div className="divide-y divide-white/05">
            {couponUsage.length === 0 ? (
              <div className="p-10 text-center text-gray-600 text-sm">No coupons created yet</div>
            ) : couponUsage.map(c => (
              <div key={c.code} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/02">
                <div>
                  <p className="text-sm font-mono font-bold text-white">{c.code}</p>
                  <p className="text-xs text-gray-500">
                    {c.discountType === "percent" ? `${c.discountValue}% off` : `+${c.discountValue} credits`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-400">{c.usedCount} uses</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-500/15 text-gray-500"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
