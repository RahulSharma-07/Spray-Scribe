"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Zap, ArrowRight, X } from "lucide-react";

const plans = [
  {
    key: "pro",
    name: "Pro",
    price: 50,
    credits: 100,
    description: "For serious content creators",
    popular: true,
    color: "text-teal-400",
    border: "border-teal-500/30",
    glow: "shadow-teal-500/10",
    bg: "from-teal-500/10 to-emerald-500/05",
    btnClass: "btn-gradient",
    features: [
      "100 credits per month",
      "Access to all 6 AI tools",
      "Unlimited content library",
      "Priority AI generation",
      "Usage analytics dashboard",
      "Priority email support",
    ],
    notIncluded: ["Full API access", "Advanced analytics", "Dedicated support"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 250,
    credits: 500,
    description: "For teams and agencies",
    popular: false,
    color: "text-amber-400",
    border: "border-amber-500/25",
    glow: "shadow-amber-500/08",
    bg: "from-amber-500/08 to-orange-500/04",
    btnClass: "btn-accent",
    features: [
      "500 credits per month",
      "Access to all 6 AI tools",
      "Unlimited content library",
      "Priority AI generation",
      "Full API access",
      "Advanced analytics",
      "Dedicated support",
    ],
    notIncluded: [],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentPlan = ((session?.user as any)?.plan ?? "FREE") as string;

  const handleSelectPlan = (planKey: string) => {
    router.push(`/checkout?plan=${planKey}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/25 bg-teal-500/08 text-teal-300 text-xs font-semibold mb-5">
          <Sparkles className="w-3 h-3" />
          Upgrade your plan
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white mb-3">
          Choose the right plan
        </h1>
        <p className="text-gray-400 text-base max-w-md mx-auto">
          Select a plan below. You'll be taken to the checkout page where you can apply a coupon code.
        </p>
      </div>

      {/* Current plan badge */}
      {currentPlan !== "FREE" && (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/05 border border-white/10 text-sm text-gray-400">
            You're currently on <span className="text-white font-semibold">{currentPlan}</span>
          </span>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, i) => {
          const isCurrentPlan = currentPlan === plan.name.toUpperCase();
          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-7 rounded-3xl bg-gradient-to-br border ${plan.bg} ${plan.border} shadow-xl ${plan.glow}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-black btn-gradient text-white shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-1">
                  <h2 className={`font-display font-black text-2xl ${plan.color}`}>{plan.name}</h2>
                  {isCurrentPlan && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-white/08 text-gray-400 border border-white/10">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{plan.description}</p>

                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-black text-white">₹{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-400">{plan.credits} credits</span>
                  <span className="text-gray-600">/ month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <X className="w-4 h-4 text-gray-700 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div className="w-full py-3.5 rounded-2xl bg-white/05 border border-white/10 text-center text-sm text-gray-500 font-semibold">
                  Your current plan
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.key)}
                  className={`w-full ${plan.btnClass} py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg`}
                >
                  <Zap className="w-4 h-4" />
                  Choose {plan.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Small print */}
              <p className="text-center text-xs text-gray-600 mt-3">
                Cancel anytime · No lock-in
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Compare to free */}
      <div className="glass border border-white/07 rounded-2xl p-5 text-center">
        <p className="text-sm text-gray-500">
          <span className="text-white font-semibold">Free plan</span> includes 10 credits on signup and access to all tools.{" "}
          <span className="text-gray-600">Upgrade when you need more.</span>
        </p>
      </div>
    </div>
  );
}
