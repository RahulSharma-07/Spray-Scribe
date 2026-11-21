import { prisma } from "@/lib/prisma";
import { CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Transactions</h1>
        <p className="text-gray-400 mt-2">Monitor all payments, top-ups, and subscription events.</p>
      </div>

      <div className="bg-white/05 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/05 text-white">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/05 transition-colors">
                  <td className="p-4">
                    <div className="text-white font-medium">{tx.user?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{tx.user?.email || "Deleted User"}</div>
                  </td>
                  <td className="p-4 font-bold text-white">
                    {tx.currency === "USD" ? "$" : ""}{tx.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {tx.status.toLowerCase() === "success" || tx.status.toLowerCase() === "paid" ? (
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Success</span>
                      ) : tx.status.toLowerCase() === "pending" ? (
                        <span className="text-yellow-400 flex items-center gap-1"><Clock className="w-4 h-4"/> Pending</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4"/> Failed</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <CreditCard className="w-8 h-8 mb-2 opacity-50" />
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
