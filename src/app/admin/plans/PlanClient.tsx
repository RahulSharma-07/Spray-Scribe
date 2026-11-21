"use client";

import { useState, useTransition } from "react";
import { PricingPlan, Plan } from "@prisma/client";
import { upsertPricingPlan } from "./actions";
import { CreditCard, Edit2, Check, X, Sparkles, IndianRupee } from "lucide-react";
import { toast } from "react-hot-toast";

const PLANS: { key: Plan; label: string; color: string; border: string }[] = [
  { key: "FREE",       label: "Free",       color: "text-gray-400",  border: "border-white/10" },
  { key: "PRO",        label: "Pro",        color: "text-teal-400",  border: "border-teal-500/30" },
  { key: "ENTERPRISE", label: "Enterprise", color: "text-amber-400", border: "border-amber-500/30" },
];

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/05 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50 transition-colors";

export default function PlanClient({ initialPlans }: { initialPlans: PricingPlan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    plan: "FREE" as Plan,
    name: "",
    price: "0",
    credits: "10",
    features: '["Feature 1", "Feature 2"]',
    isPopular: false,
  });

  const openEdit = (planKey: Plan) => {
    const existing = plans.find(p => p.plan === planKey);
    if (existing) {
      setForm({
        plan: existing.plan,
        name: existing.name,
        price: existing.price.toString(),
        credits: existing.credits.toString(),
        features: JSON.stringify(existing.features, null, 2),
        isPopular: existing.isPopular,
      });
    } else {
      setForm({ plan: planKey, name: planKey, price: "0", credits: "10", features: '["Feature 1"]', isPopular: false });
    }
    setEditing(planKey);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await upsertPricingPlan(form);
        // Update local state
        const updated = {
          ...plans.find(p => p.plan === form.plan),
          plan: form.plan,
          name: form.name,
          price: parseFloat(form.price),
          credits: parseInt(form.credits),
          features: JSON.parse(form.features),
          isPopular: form.isPopular,
          currency: "INR",
          id: plans.find(p => p.plan === form.plan)?.id ?? crypto.randomUUID(),
          stripePriceId: null,
          razorpayPlanId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PricingPlan;
        setPlans(prev => {
          const idx = prev.findIndex(p => p.plan === form.plan);
          if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
          return [...prev, updated];
        });
        setEditing(null);
        toast.success("Plan saved!");
      } catch (e: any) { toast.error(e.message ?? "Invalid JSON — check features array"); }
    });
  };

  return (
    <div className="space-y-6">

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="glass border border-white/08 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-400" /> Editing: {editing}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-lg glass border border-white/10 text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Display Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Price (₹ / month) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input required type="number" step="0.01" min="0"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className={`${inputCls} pl-7`} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Monthly Credits *</label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
                <input required type="number" min="0"
                  value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })}
                  className={`${inputCls} pl-8`} />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Features (JSON string array) *</label>
              <textarea required rows={4}
                value={form.features} onChange={e => setForm({ ...form, features: e.target.value })}
                className={`${inputCls} font-mono text-xs resize-none`} />
              <p className="text-xs text-gray-600 mt-1">e.g. ["100 Credits/month", "All tools", "Priority support"]</p>
            </div>
            <div className="flex items-center gap-2 col-span-full">
              <input type="checkbox" id="popular" checked={form.isPopular}
                onChange={e => setForm({ ...form, isPopular: e.target.checked })}
                className="w-4 h-4 rounded accent-teal-500" />
              <label htmlFor="popular" className="text-sm text-gray-300">Mark as Most Popular</label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-white/08">
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 btn-gradient rounded-xl text-white text-sm font-bold disabled:opacity-50">
              <Check className="w-4 h-4" /> Save Plan
            </button>
            <button type="button" onClick={() => setEditing(null)}
              className="px-6 py-2.5 glass border border-white/10 rounded-xl text-gray-400 text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(({ key, label, color, border }) => {
          const db = plans.find(p => p.plan === key);
          return (
            <div key={key} className={`relative glass border rounded-2xl p-6 ${db?.isPopular ? "border-teal-500/40" : border}`}>
              {db?.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black btn-gradient text-white">MOST POPULAR</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`font-display font-black text-xl ${color}`}>{db?.name ?? label}</h3>
                  {db ? (
                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className="text-3xl font-black text-white">₹{db.price}</span>
                      <span className="text-gray-500 text-sm">/mo</span>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm mt-1">Not configured</p>
                  )}
                </div>
                <button onClick={() => openEdit(key)}
                  className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {db ? (
                <>
                  <div className="flex items-center gap-1.5 mb-4 text-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-white">{db.credits}</span>
                    <span className="text-gray-500">credits / month</span>
                  </div>
                  <ul className="space-y-2">
                    {(db.features as string[]).slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                        <Check className="w-3 h-3 text-teal-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {(db.features as string[]).length > 5 && (
                      <li className="text-xs text-gray-600">+{(db.features as string[]).length - 5} more</li>
                    )}
                  </ul>
                </>
              ) : (
                <button onClick={() => openEdit(key)}
                  className="w-full mt-2 py-2 glass border border-white/10 rounded-xl text-xs text-gray-500 hover:text-white transition-colors">
                  Configure this plan →
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600">
        Price changes are reflected immediately on the public pricing page. Credits per plan are used as the monthly allocation for new subscriptions.
      </p>
    </div>
  );
}
