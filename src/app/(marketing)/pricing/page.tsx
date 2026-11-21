import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, X, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/ui/magnetic";

export const metadata: Metadata = { title: "Pricing — Spray Scribe" };

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "Perfect to get started",
    credits: 10,
    features: [
      { text: "10 credits on signup", included: true },
      { text: "Access to all 6 AI tools", included: true },
      { text: "Content library (save 50 items)", included: true },
      { text: "Copy & download outputs", included: true },
      { text: "Basic export options", included: true },
      { text: "Priority AI generation", included: false },
      { text: "API key access", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/signup",
    highlight: false,
    gradient: "from-white/04 to-white/01 border-white/08 hover:border-white/15",
    ctaClass: "glass border border-white/15 hover:border-white/30 text-white transition-all",
  },
  {
    name: "Pro",
    price: "₹50",
    period: "/month",
    description: "For serious content creators",
    credits: 100,
    features: [
      { text: "100 credits per month", included: true },
      { text: "Access to all 6 AI tools", included: true },
      { text: "Unlimited content library", included: true },
      { text: "Copy & download outputs", included: true },
      { text: "PDF export options", included: true },
      { text: "Priority AI generation", included: true },
      { text: "Usage analytics dashboard", included: true },
      { text: "Priority email support", included: true },
      { text: "API key access", included: false },
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/checkout?plan=pro",
    highlight: true,
    gradient: "from-indigo-500/12 to-violet-500/08 border-indigo-500/25",
    ctaClass: "btn-gradient text-white shadow-xl shadow-indigo-500/20",
  },
  {
    name: "Enterprise",
    price: "₹250",
    period: "/month",
    description: "For teams and agencies",
    credits: 500,
    features: [
      { text: "500 credits per month", included: true },
      { text: "Access to all 6 AI tools", included: true },
      { text: "Unlimited content library", included: true },
      { text: "All export options", included: true },
      { text: "Team collaboration (coming soon)", included: true },
      { text: "Priority AI generation", included: true },
      { text: "Full API access", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Dedicated support", included: true },
    ],
    cta: "Get Enterprise",
    ctaHref: "/checkout?plan=enterprise",
    highlight: false,
    gradient: "from-violet-500/08 to-pink-500/04 border-violet-500/15 hover:border-violet-500/25",
    ctaClass: "glass border border-violet-500/25 hover:border-violet-500/40 text-white transition-all",
  },
];

const faqs = [
  { q: "What are credits?", a: "Credits are the currency for generating AI content. Different tools use different amounts — for example, Blog Generator uses 3 credits while Instagram Captions use 1 credit per generation." },
  { q: "Do unused credits roll over?", a: "Credits reset each month on your billing date. We recommend upgrading if you consistently run out." },
  { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription at any time. You'll retain access until the end of your billing period." },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards via Stripe. Indian users can also pay with UPI, net banking via Razorpay." },
  { q: "Is there a free trial?", a: "Yes — all new accounts start with 10 free credits, no credit card required. Use them to try any tool." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-28 hero-bg grid-overlay text-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/25 bg-teal-500/08 text-teal-300 text-xs font-semibold tracking-wide mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Pricing
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
            Simple, honest <span className="gradient-text">pricing.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-3">Start free. Upgrade when you need more.</p>
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1.5">
            <span className="text-emerald-400 font-semibold">✓</span> No credit card required to start
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl bg-gradient-to-br border transition-all duration-300 ${plan.gradient} ${plan.highlight ? "scale-105 shadow-2xl shadow-blue-500/20" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="font-display font-black text-2xl text-white mb-1">{plan.name}</h2>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-yellow-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold">{plan.credits} credits</span>
                    <span className="text-gray-500">/ month</span>
                  </div>
                </div>

                <Magnetic>
                  <Link href={plan.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm mb-6 ${plan.ctaClass} shadow-xl`}>
                    {plan.highlight && <Zap className="w-4 h-4 group-hover:animate-pulse" />}
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 duration-300" />
                  </Link>
                </Magnetic>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5 text-sm">
                      {feature.included
                        ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />}
                      <span className={feature.included ? "text-gray-300" : "text-gray-600"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Cost Table */}
      <section className="py-16 bg-black/20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-black text-white text-center mb-10">
            Credit Cost per Tool
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {[
              { tool: "Blog Generator", credits: 3, desc: "Full SEO blog post" },
              { tool: "Instagram Caption Generator", credits: 1, desc: "Captions + hashtags" },
              { tool: "Product Description Generator", credits: 2, desc: "Description + bullets + CTA" },
              { tool: "YouTube Description & Keywords", credits: 2, desc: "Description + keywords + hashtags" },
              { tool: "YouTube Trending Script", credits: 4, desc: "Full video script (all sections)" },
              { tool: "Code Assistant", credits: 2, desc: "Code solution + explanation" },
            ].map((item, i) => (
              <div key={item.tool} className={`flex items-center justify-between p-4 ${i !== 0 ? "border-t border-white/08" : ""} ${i % 2 === 0 ? "bg-white/02" : ""}`}>
                <div>
                  <p className="font-medium text-white text-sm">{item.tool}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">{item.credits}</span>
                  <span className="text-gray-500 text-xs">credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-black text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl glass border border-white/08 hover:border-white/15 transition-all">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/06 text-center px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-3xl font-black text-white mb-4">
            Start <span className="gradient-text">creating for free</span>
          </h2>
          <p className="text-gray-500 mb-8 text-sm">No credit card needed. 10 free credits. Cancel anytime.</p>
          <Link href="/signup" className="btn-gradient inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-semibold text-base shadow-2xl shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
