"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
const Suspense = React.Suspense;
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Tag, X, Loader2, Sparkles,
  ShieldCheck, CreditCard, AlertCircle, ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const PLANS = {
  pro: {
    name: "Pro", price: 50, credits: 100,
    color: "text-teal-400", border: "border-teal-500/25",
    features: [
      "100 credits per month",
      "All 6 AI tools",
      "Unlimited content library",
      "Priority AI generation",
      "Priority email support",
    ],
  },
  enterprise: {
    name: "Enterprise", price: 250, credits: 500,
    color: "text-amber-400", border: "border-amber-500/25",
    features: [
      "500 credits per month",
      "All 6 AI tools + API access",
      "Unlimited content library",
      "Advanced analytics",
      "Dedicated support",
    ],
  },
};
type PlanKey = keyof typeof PLANS;

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: "percent" | "flat_credits";
  discountValue: number;
  description: string | null;
}

function CheckoutContent() {
  const searchParams              = useSearchParams();
  const router                    = useRouter();
  const { data: session, update } = useSession();

  const planKey = (searchParams.get("plan") ?? "pro") as PlanKey;
  const plan    = PLANS[planKey] ?? PLANS.pro;

  const [couponCode,    setCouponCode]    = useState(searchParams.get("coupon") ?? "");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError,   setCouponError]   = useState("");
  const [validating,    setValidating]    = useState(false);
  const [placing,       setPlacing]       = useState(false);

  /* ── Derived prices ── */
  const discountAmount = appliedCoupon?.discountType === "percent"
    ? Math.round((plan.price * appliedCoupon.discountValue) / 100) : 0;
  const bonusCredits   = appliedCoupon?.discountType === "flat_credits"
    ? appliedCoupon.discountValue : 0;
  const finalPrice     = Math.max(0, plan.price - discountAmount);
  const totalCredits   = plan.credits + bonusCredits;

  /* ── Coupon validation ── */
  const validateCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError("");
    try {
      const res  = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        toast.success("Coupon applied!");
      }
    } catch {
      setCouponError("Could not validate. Try again.");
    } finally {
      setValidating(false);
    }
  }, [couponCode, planKey]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  /* Auto-validate coupon passed in URL */
  useEffect(() => {
    if (searchParams.get("coupon")) validateCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Razorpay Payment ── */
  const handlePurchase = async () => {
    if (!session?.user) { router.push("/login"); return; }
    setPlacing(true);
    try {
      // 1. Create a Razorpay order on the server
      const orderRes = await fetch("/api/checkout/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: finalPrice }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error ?? "Could not initiate payment");
        return;
      }

      // 2. Open Razorpay checkout popup
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "Spray Scribe",
        description: `${plan.name} Plan — ${totalCredits} credits`,
        order_id:    orderData.orderId,
        prefill: {
          name:  session.user.name  ?? "",
          email: session.user.email ?? "",
        },
        theme: { color: "#0d9488" },
        handler: async (response: {
          razorpay_order_id:   string;
          razorpay_payment_id: string;
          razorpay_signature:  string;
        }) => {
          // 3. Verify payment on the server and upgrade the plan
          const verifyRes = await fetch("/api/checkout/verify", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan:        planKey,
              couponId:    appliedCoupon?.id ?? null,
              finalPrice,
              totalCredits,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast.error(verifyData.error ?? "Payment verification failed");
            setPlacing(false);
            return;
          }
          // 4. Refresh session and redirect
          await update({ credits: verifyData.credits, plan: verifyData.plan });
          toast.success(`🎉 You're on ${plan.name}! ${totalCredits} credits added.`);
          router.push("/dashboard");
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      // Load Razorpay script dynamically if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script    = document.createElement("script");
          script.src      = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload   = () => resolve();
          script.onerror  = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPlacing(false);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
      setPlacing(false);
    }
    // Note: setPlacing(false) is handled inside handler/ondismiss/payment.failed
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black text-white">Checkout</h1>
          <p className="text-sm text-gray-500">Review your order and complete payment</p>
        </div>
      </div>

      {/* Main grid — Order summary (left) + Coupon & Payment (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── LEFT: Order summary ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Plan card */}
          <div className="glass border border-white/08 rounded-2xl p-6">
            <h2 className="font-display font-bold text-white text-lg mb-5">Order Summary</h2>

            <div className={`flex items-start gap-4 p-4 rounded-xl bg-white/03 border ${plan.border} mb-5`}>
              <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-display font-black text-lg ${plan.color}`}>{plan.name} Plan</span>
                  <span className="text-white font-bold text-lg flex-shrink-0">
                    ₹{plan.price}<span className="text-gray-500 text-xs font-normal">/mo</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-semibold">{plan.credits} credits</span>
                  <span className="text-gray-600">/ month</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Price breakdown */}
            <div className="border-t border-white/08 pt-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{plan.name} Plan (monthly)</span>
                <span className="text-white">₹{plan.price}</span>
              </div>

              {appliedCoupon && discountAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-teal-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {appliedCoupon.code} ({appliedCoupon.discountValue}% off)
                  </span>
                  <span className="text-teal-400 font-semibold">−₹{discountAmount}</span>
                </motion.div>
              )}

              {appliedCoupon && bonusCredits > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {appliedCoupon.code} (+{bonusCredits} credits)
                  </span>
                  <span className="text-amber-400 font-semibold">FREE</span>
                </motion.div>
              )}

              <div className="flex items-baseline justify-between pt-3 border-t border-white/08">
                <span className="font-bold text-white">Total due today</span>
                <div className="text-right">
                  {discountAmount > 0 && (
                    <span className="text-xs text-gray-600 line-through mr-1.5">₹{plan.price}</span>
                  )}
                  <span className="text-2xl font-black text-white">₹{finalPrice}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
              </div>

              {bonusCredits > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Credits this month</span>
                  <span className="text-amber-400 font-bold">{totalCredits} credits</span>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "Secure payment", sub: "256-bit SSL" },
              { icon: CreditCard,  label: "UPI / Card",     sub: "All methods" },
              { icon: Sparkles,    label: "Cancel anytime", sub: "No lock-in" },
            ].map(b => (
              <div key={b.label} className="glass border border-white/07 rounded-xl p-4 text-center">
                <b.icon className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">{b.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Coupon + Payment ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Coupon */}
          <div className="glass border border-white/08 rounded-2xl p-6">
            <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2 text-base">
              <Tag className="w-4 h-4 text-teal-400" /> Have a coupon?
            </h2>

            <AnimatePresence mode="wait">
              {appliedCoupon ? (
                <motion.div
                  key="applied"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/25"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-teal-300 font-mono tracking-wider">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-teal-500 mt-0.5">
                        {appliedCoupon.discountType === "percent"
                          ? `${appliedCoupon.discountValue}% discount applied`
                          : `+${appliedCoupon.discountValue} bonus credits`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 rounded-lg text-teal-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && validateCoupon()}
                      placeholder="LAUNCH50"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || validating}
                      className="px-4 py-3 btn-gradient rounded-xl text-white text-sm font-bold disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-xs text-red-400 mt-2 ml-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment */}
          <div className="glass border border-white/08 rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-white flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-teal-400" /> Payment
            </h2>

            {/* Amount summary */}
            <div className="p-4 rounded-xl bg-white/03 border border-white/08">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-gray-400 text-sm">Amount due today</span>
                <span className="text-2xl font-black text-white">₹{finalPrice}</span>
              </div>
              <p className="text-xs text-gray-600">
                Then ₹{finalPrice}/month · cancel anytime
              </p>
              {bonusCredits > 0 && (
                <p className="text-xs text-amber-400 mt-1.5 font-semibold">
                  {totalCredits} credits this month (normally {plan.credits})
                </p>
              )}
            </div>

            {/* Pay button */}
            <button
              onClick={handlePurchase}
              disabled={placing}
              className="w-full btn-gradient py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-xl shadow-teal-500/15"
            >
              {placing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Pay ₹{finalPrice} · Get {totalCredits} Credits</>
              )}
            </button>

            <p className="text-center text-xs text-gray-600">
              By upgrading you agree to our{" "}
              <Link href="/terms" className="text-teal-500 hover:text-teal-400 transition-colors">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-teal-500 hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
