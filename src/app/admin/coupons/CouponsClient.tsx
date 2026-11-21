"use client";

import { useState, useTransition } from "react";
import { Tag, Plus, Trash2, Power, PowerOff, Copy, CheckCircle2 } from "lucide-react";
import { createCoupon, toggleCoupon, deleteCoupon } from "./actions";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  _count: { redemptions: number };
}

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/05 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50 transition-colors";

function formatDate(d: Date | null) {
  if (!d) return "No expiry";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    code: "", description: "", discountType: "percent",
    discountValue: "", maxUses: "", expiresAt: "",
  });

  const handleCreate = () => {
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    const val = parseFloat(form.discountValue);
    if (!val || val <= 0) { toast.error("Invalid discount value"); return; }

    startTransition(async () => {
      try {
        await createCoupon({
          code: form.code,
          description: form.description || undefined,
          discountType: form.discountType as "percent" | "flat_credits",
          discountValue: val,
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        });
        const newCoupon: Coupon = {
          id: crypto.randomUUID(),
          code: form.code.trim().toUpperCase(),
          description: form.description || null,
          discountType: form.discountType,
          discountValue: val,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          usedCount: 0,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
          isActive: true,
          createdAt: new Date(),
          _count: { redemptions: 0 },
        };
        setCoupons(prev => [newCoupon, ...prev]);
        setForm({ code: "", description: "", discountType: "percent", discountValue: "", maxUses: "", expiresAt: "" });
        setShowForm(false);
        toast.success("Coupon created!");
      } catch (e: any) { toast.error(e.message ?? "Failed to create coupon"); }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleCoupon(id, !current);
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    startTransition(async () => {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success("Deleted");
    });
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="glass border border-white/08 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-400" /> Create Coupon
          </h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-xl text-sm font-bold text-white">
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>

        {showForm && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-white/08 pt-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Code *</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. LAUNCH50" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Type</label>
              <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className={inputCls}>
                <option value="percent">Percent off (%)</option>
                <option value="flat_credits">Bonus Credits</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                {form.discountType === "percent" ? "Discount %" : "Bonus Credits"} *
              </label>
              <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === "percent" ? "50" : "25"} min="1" max={form.discountType === "percent" ? "100" : undefined}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Max Uses (blank = unlimited)</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })}
                placeholder="e.g. 100" min="1" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Internal note" className={inputCls} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={isPending}
                className="btn-gradient px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50">
                Create Coupon
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl glass border border-white/10 text-gray-400 text-sm hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Coupon List */}
      <div className="glass border border-white/08 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/08 flex items-center justify-between">
          <h2 className="font-bold text-white">All Coupons</h2>
          <span className="text-xs text-gray-500 bg-white/05 px-3 py-1 rounded-full">{coupons.length} total</span>
        </div>

        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No coupons yet. Create one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/05">
            {coupons.map(c => (
              <div key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-white/02 group">
                {/* Code */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="font-mono font-black text-white text-sm tracking-wider">{c.code}</span>
                  <button onClick={() => copyCode(c.code, c.id)}
                    className="p-1 rounded text-gray-600 hover:text-teal-400 transition-colors">
                    {copiedId === c.id ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Type + Value */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    c.discountType === "percent"
                      ? "bg-teal-500/15 text-teal-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {c.discountType === "percent" ? `${c.discountValue}% off` : `+${c.discountValue} credits`}
                  </span>
                </div>

                {/* Usage */}
                <div className="text-sm text-gray-400">
                  <span className="text-white font-semibold">{c.usedCount}</span>
                  {c.maxUses ? ` / ${c.maxUses}` : " uses"}
                </div>

                {/* Expiry */}
                <div className="text-xs text-gray-500 flex-1">{formatDate(c.expiresAt)}</div>

                {/* Description */}
                {c.description && <div className="text-xs text-gray-600 italic">{c.description}</div>}

                {/* Status + Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-500/15 text-gray-500"
                  }`}>{c.isActive ? "Active" : "Inactive"}</span>
                  <button onClick={() => handleToggle(c.id, c.isActive)} disabled={isPending}
                    className="p-1.5 rounded-lg hover:bg-white/08 text-gray-500 hover:text-white transition-all">
                    {c.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4 text-teal-400" />}
                  </button>
                  <button onClick={() => handleDelete(c.id)} disabled={isPending}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
