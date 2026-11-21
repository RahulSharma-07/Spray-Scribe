"use client";

import { useState } from "react";
import { User, Role } from "@prisma/client";
import { updateUserCredits, updateUserRole, updateUserPlan, deleteUser, giftCredits } from "./actions";
import { Shield, ShieldOff, Trash2, Coins, CreditCard, Gift } from "lucide-react";
import { toast } from "react-hot-toast";

type UserWithDetails = User;

export default function UserTable({ initialUsers }: { initialUsers: UserWithDetails[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const handleUpdatePlan = async (id: string, newPlan: "FREE" | "PRO" | "ENTERPRISE") => {
    try {
      await updateUserPlan(id, newPlan);
      setUsers(users.map(u => u.id === id ? { ...u, plan: newPlan } : u));
      toast.success("Plan updated");
    } catch { toast.error("Failed to update plan"); }
    finally { setEditingPlan(null); }
  };

  const handleUpdateCredits = async (id: string, currentCredits: number) => {
    const val = prompt("Set credits to:", currentCredits.toString());
    if (val === null) return;
    const n = parseInt(val, 10);
    if (isNaN(n)) return toast.error("Invalid number");
    try {
      await updateUserCredits(id, n);
      setUsers(users.map(u => u.id === id ? { ...u, credits: n } : u));
      toast.success("Credits updated");
    } catch { toast.error("Failed"); }
  };

  const handleGiftCredits = async (id: string, name: string | null) => {
    const amtStr = prompt(`Gift bonus credits to ${name ?? "user"}:\nEnter amount:`);
    if (!amtStr) return;
    const amt = parseInt(amtStr, 10);
    if (isNaN(amt) || amt <= 0) return toast.error("Enter a positive number");
    const reason = prompt("Reason (optional — shown in activity log):") ?? undefined;
    try {
      await giftCredits(id, amt, reason ?? undefined);
      setUsers(users.map(u => u.id === id ? { ...u, credits: u.credits + amt } : u));
      toast.success(`Gifted ${amt} credits to ${name ?? "user"}`);
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };

  const handleToggleRole = async (id: string, currentRole: Role) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await updateUserRole(id, newRole);
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      toast.success("Role updated");
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  return (
    <div className="bg-white/05 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/05 text-white">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Credits</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/05 transition-colors">
                {/* Name */}
                <td className="p-4 font-medium text-white">{user.name || "—"}</td>

                {/* Email */}
                <td className="p-4">{user.email}</td>

                {/* Plan */}
                <td className="p-4">
                  {editingPlan === user.id ? (
                    <select
                      autoFocus
                      defaultValue={user.plan}
                      onBlur={() => setEditingPlan(null)}
                      onChange={e => handleUpdatePlan(user.id, e.target.value as "FREE" | "PRO" | "ENTERPRISE")}
                      className="bg-[#1c1917] border border-white/20 text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PRO">PRO</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingPlan(user.id)}
                      title="Click to change plan"
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold hover:opacity-70 transition-opacity ${
                        user.plan === "PRO"        ? "bg-teal-500/10 text-teal-400" :
                        user.plan === "ENTERPRISE" ? "bg-amber-500/10 text-amber-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {user.plan} <CreditCard className="w-3 h-3" />
                    </button>
                  )}
                </td>

                {/* Role */}
                <td className="p-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === "ADMIN" ? "bg-rose-500/10 text-rose-400" : "bg-gray-500/10 text-gray-400"
                  }`}>
                    {user.role}
                  </span>
                </td>

                {/* Credits */}
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white font-semibold">{user.credits.toLocaleString()}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex justify-end items-center gap-1">
                    {/* Gift credits */}
                    <button
                      onClick={() => handleGiftCredits(user.id, user.name)}
                      title="Gift bonus credits"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                      <Gift className="w-4 h-4" />
                    </button>

                    {/* Set credits */}
                    <button
                      onClick={() => handleUpdateCredits(user.id, user.credits)}
                      title="Set credits to exact value"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Coins className="w-4 h-4" />
                    </button>

                    {/* Toggle role */}
                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      title="Toggle admin role"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-white/10 transition-all"
                    >
                      {user.role === "ADMIN"
                        ? <ShieldOff className="w-4 h-4 text-rose-400" />
                        : <Shield className="w-4 h-4 text-teal-400" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(user.id)}
                      title="Delete user"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
