import type { Metadata } from "next";
import { motion } from "framer-motion";
import {
  Zap, Shield, Globe, Cpu, BarChart3, Clock, Lock,
  RefreshCw, Download, BookOpen, Sparkles, Smartphone,
  Code2, PenTool, Target, Layers, ArrowRight
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Features — Spray Scribe" };

const features = [
  {
    category: "AI Content Tools",
    items: [
      { icon: PenTool, title: "Blog Generator", desc: "Create full SEO-optimized blog posts with structured headings, compelling intros, and keyword-rich content in under 30 seconds." },
      { icon: Sparkles, title: "Instagram Caption Generator", desc: "Generate viral-worthy captions with trending hashtags tailored to your audience and brand tone." },
      { icon: Target, title: "Product Description Generator", desc: "Write benefit-driven, conversion-focused product copy with bullet points and persuasive CTAs." },
      { icon: Cpu, title: "YouTube Suite", desc: "Get complete video descriptions, SEO keyword tags, hashtags, and full trending scripts all in one place." },
      { icon: Code2, title: "Code Assistant", desc: "Solve coding problems with clean, syntax-highlighted solutions and detailed step-by-step explanations." },
    ],
  },
  {
    category: "Productivity Features",
    items: [
      { icon: RefreshCw, title: "Regenerate Anytime", desc: "Not satisfied with the output? Regenerate with one click and get a fresh take on your content." },
      { icon: Download, title: "Export & Download", desc: "Copy to clipboard or download as a text file. Your content, your way." },
      { icon: BookOpen, title: "Content Library", desc: "All generated content is automatically saved. Search, filter, view, edit, or delete anytime." },
      { icon: Clock, title: "History & Reuse", desc: "Access your full generation history and reuse past inputs with one click." },
      { icon: BarChart3, title: "Usage Analytics", desc: "Track your credit usage, generation history, and productivity stats on your dashboard." },
    ],
  },
  {
    category: "Platform & Security",
    items: [
      { icon: Shield, title: "Secure by Default", desc: "All API calls are server-side. Your data is encrypted and never exposed to third parties." },
      { icon: Lock, title: "Role-Based Access", desc: "Separate user and admin roles with protected routes and server-enforced permissions." },
      { icon: Globe, title: "Multi-Language Support", desc: "Generate content in 8+ languages including English, Hindi, Spanish, French, and more." },
      { icon: Smartphone, title: "Fully Responsive", desc: "Works beautifully on desktop, tablet, and mobile. Create content from anywhere." },
      { icon: Layers, title: "Credit System", desc: "Fair usage-based credit system with transparent pricing. Upgrade when you need more." },
      { icon: Zap, title: "Fast Generation", desc: "Powered by GPT-4o-mini for lightning-fast responses without compromising quality." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-28 hero-bg grid-overlay text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-6">
            PLATFORM FEATURES
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Everything You Need to{" "}
            <span className="gradient-text">Create at Scale</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            6 AI-powered tools, smart content library, credit system, and enterprise-grade security — all in one platform.
          </p>
          <Link href="/signup" className="btn-gradient inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-2xl shadow-blue-500/25 group">
            <Sparkles className="w-5 h-5" />
            Start for Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((section, si) => (
        <section key={section.category} className={`py-20 ${si % 2 === 1 ? "bg-black/20" : ""}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-4">
                {section.category.toUpperCase()}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.items.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl glass border border-white/08 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-11 h-11 rounded-xl btn-gradient flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Bottom */}
      <section className="py-20 border-t border-white/08">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl font-black text-white mb-4">
            Ready to <span className="gradient-text">Start Creating?</span>
          </h2>
          <p className="text-gray-400 mb-8">Join thousands of creators. Get 10 free credits on signup.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-gradient inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold shadow-xl shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/15 text-white font-semibold hover:border-white/30 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
