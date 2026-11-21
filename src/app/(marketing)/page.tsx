"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenTool, Image, ShoppingBag, Youtube, Code2,
  Sparkles, ArrowRight, CheckCircle2, Star,
  Zap, MessageSquare, Clock, Shield
} from "lucide-react";
import { Magnetic } from "@/components/ui/magnetic";

const tools = [
  {
    icon: PenTool,
    label: "Blog Generator",
    desc: "Full SEO blog posts with structured headings, keyword density, and a natural tone — not robotic filler.",
    href: "/tools/blog-generator",
    accent: "text-violet-400",
    bg: "bg-violet-500/08 border-violet-500/15 hover:border-violet-500/30",
    dot: "bg-violet-400",
  },
  {
    icon: Image,
    label: "Instagram Captions",
    desc: "Captions that stop the scroll. Hooks, emojis, trending hashtags — in your brand voice.",
    href: "/tools/instagram-caption",
    accent: "text-pink-400",
    bg: "bg-pink-500/08 border-pink-500/15 hover:border-pink-500/30",
    dot: "bg-pink-400",
  },
  {
    icon: ShoppingBag,
    label: "Product Descriptions",
    desc: "Copy that sells features as benefits and nudges the reader toward the buy button.",
    href: "/tools/product-description",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/08 border-emerald-500/15 hover:border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  {
    icon: Youtube,
    label: "YouTube Suite",
    desc: "Description + 30 SEO tags + 15 hashtags + timestamps — everything YouTube needs to rank your video.",
    href: "/tools/youtube-description",
    accent: "text-red-400",
    bg: "bg-red-500/08 border-red-500/15 hover:border-red-500/30",
    dot: "bg-red-400",
  },
  {
    icon: Code2,
    label: "Code Assistant",
    desc: "Paste a problem, get a clean solution with step-by-step explanation and optimization tips.",
    href: "/tools/code-assistant",
    accent: "text-sky-400",
    bg: "bg-sky-500/08 border-sky-500/15 hover:border-sky-500/30",
    dot: "bg-sky-400",
  },
  {
    icon: MessageSquare,
    label: "AI Chat Mode",
    desc: "Freeform conversations with an AI that understands context — brainstorm, refine, ask anything.",
    href: "/signup",
    accent: "text-amber-400",
    bg: "bg-amber-500/08 border-amber-500/15 hover:border-amber-500/30",
    dot: "bg-amber-400",
  },
];

const steps = [
  { n: "01", title: "Pick a tool", body: "Six tools — blog, captions, YouTube, product copy, code, and chat. Each one purpose-built.", icon: Zap },
  { n: "02", title: "Fill in your brief", body: "Topic, tone, audience — a 30-second form, not a 10-minute setup process.", icon: PenTool },
  { n: "03", title: "Get usable content", body: "Structured, formatted output you can copy, download, or save to your library instantly.", icon: Sparkles },
];

const reviews = [
  { name: "Aisha P.", role: "Content Marketer", text: "Went from spending 3 hours on a blog to 15 minutes. I didn't expect the quality to be this good.", stars: 5 },
  { name: "Marcus J.", role: "YouTube Creator", text: "The YouTube suite alone is worth it. Description, tags, timestamps — done in one click.", stars: 5 },
  { name: "Priya S.", role: "E-commerce Owner", text: "My product page conversion went up after I switched to AI-generated descriptions. That surprised me.", stars: 5 },
];

const faqs = [
  { q: "What are credits?", a: "One credit = one generation. Different tools cost different amounts (1–4 credits). You can see the cost on each tool's page before generating." },
  { q: "What happens when I run out?", a: "You can't generate until you top up or upgrade. Credits don't expire, and unused ones roll over month to month on paid plans." },
  { q: "Is the free tier actually useful?", a: "10 free credits on signup. That's roughly 3 blog posts, or 10 Instagram captions. Enough to know if it works for you before paying anything." },
  { q: "What languages are supported?", a: "You can prompt in any language. The AI responds in whatever language you write in, and the blog generator has an explicit language selector." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center hero-bg grid-overlay pt-20">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-pink-600/08 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-600/07 blur-[90px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/25 bg-teal-500/08 text-teal-300 text-xs font-semibold tracking-wide mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              AI content tools — 10 free credits on signup
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-7">
              Write better content.{" "}
              <span className="gradient-text">Ten times faster.</span>
            </h1>

            {/* Sub */}
            <p className="text-xl text-gray-400 leading-relaxed max-w-xl mb-10">
              Six AI tools for the content you create every week — blogs, captions, YouTube, product copy, code, and chat. No subscriptions to start.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 items-center">
              <Magnetic>
                <Link
                  href="/signup"
                  className="btn-gradient inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-xl shadow-indigo-500/25 group"
                >
                  <Sparkles className="w-4.5 h-4.5" />
                  Start free — no card needed
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Magnetic>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-gray-300 font-semibold text-base hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                See pricing
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-gray-500">
              {["10 free credits", "No credit card", "Cancel anytime"].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Tool pills — floating row */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-16 flex flex-wrap gap-2.5"
          >
            {tools.map(t => (
              <Link
                key={t.label}
                href={t.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${t.bg} ${t.accent}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                {t.label}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TOOLS GRID ── */}
      <section className="py-28 bg-[#060811]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">What you get</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight max-w-xl">
              Six tools. One place.
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg">
              Each tool is purpose-built for one job and does it well — not a catch-all AI chat box.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={t.href} className="group block h-full">
                  <div className={`h-full p-6 rounded-2xl border transition-all duration-200 card-hover ${t.bg}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${t.accent} bg-white/05`}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-white text-base mb-2">{t.label}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
                    <div className={`mt-5 flex items-center gap-1 text-xs font-semibold ${t.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Try it free <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 border-y border-white/06">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-bold text-pink-400 tracking-widest uppercase mb-3">How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight">
              Three steps, then you're done.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent -z-0 translate-x-4" />
                )}
                <div className="text-7xl font-black text-white/[0.03] font-display leading-none select-none mb-[-1.5rem]">{s.n}</div>
                <div className="w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20 relative z-10">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-28 bg-[#060811]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-3">What people say</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight max-w-lg">
              Real results, not marketing copy.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="p-6 rounded-2xl border border-white/07 bg-white/[0.02] hover:border-white/12 transition-all"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-xs font-black text-white">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{r.name}</div>
                    <div className="text-gray-600 text-xs">{r.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-28 border-t border-white/06">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold text-sky-400 tracking-widest uppercase mb-3">Questions</p>
            <h2 className="font-display text-4xl font-black text-white">The ones we actually get asked.</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border border-white/07 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/02 transition-colors"
                >
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  <span className={`text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/></svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/06 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 border-t border-white/06">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/06 text-teal-300 text-xs font-semibold mb-8">
              <Shield className="w-3 h-3" /> No credit card. No catch.
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              Ten free credits.<br />
              <span className="gradient-text">Start right now.</span>
            </h2>
            <p className="text-gray-500 mb-10">
              Enough to generate 3 blog posts, 10 captions, or 5 YouTube descriptions before you decide anything.
            </p>
            <Magnetic>
              <Link
                href="/signup"
                className="btn-gradient inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white font-bold text-base shadow-2xl shadow-indigo-500/25 group"
              >
                <Sparkles className="w-5 h-5" />
                Create my free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
