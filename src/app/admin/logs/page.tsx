import { prisma } from "@/lib/prisma";
import { ShieldAlert, Activity, Shield } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const [activityLogs, usageLogs] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.usageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true } } }
    })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">System Logs</h1>
        <p className="text-gray-400 mt-2">Audit trails, security events, and granular system usage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security / Activity Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" /> Security & Activity
          </h2>
          <div className="bg-white/05 border border-white/10 rounded-2xl p-4 h-[600px] overflow-y-auto w-full space-y-3">
            {activityLogs.map(log => (
              <div key={log.id} className="border-b border-white/05 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-200">{log.action}</span>
                  <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{log.details || "No details provided."}</div>
                {log.ipAddress && <div className="text-[10px] text-gray-600 mt-1">IP: {log.ipAddress}</div>}
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-10">No recent activity logs.</div>
            )}
          </div>
        </div>

        {/* Usage Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Prompt & Usage Engine
          </h2>
          <div className="bg-white/05 border border-white/10 rounded-2xl p-4 h-[600px] overflow-y-auto w-full space-y-3">
            {usageLogs.map(log => (
              <div key={log.id} className="border-b border-white/05 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-400">{log.toolType.replace(/_/g, " ")}</span>
                  <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">User: {log.user?.email || "Unknown"}</div>
                <div className="text-[10px] font-bold mt-1 text-yellow-500">Credits Deducted: {log.credits}</div>
              </div>
            ))}
            {usageLogs.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-10">No recent usage logs.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
