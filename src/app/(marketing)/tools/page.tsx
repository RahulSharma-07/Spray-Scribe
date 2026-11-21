import type { Metadata } from "next";
import Link from "next/link";
import { PenTool, Image, ShoppingBag, Youtube, Film, Code2, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "AI Tools — Spray Scribe" };

const tools = [
  { href: "/tools/blog-generator", icon: PenTool, label: "Blog Generator", desc: "SEO-optimized blog posts with structured headings and compelling content.", color: "blue", credits: 3 },
  { href: "/tools/instagram-caption", icon: Image, label: "Instagram Caption Generator", desc: "Viral captions with trending hashtags tailored to your audience.", color: "pink", credits: 1 },
  { href: "/tools/product-description", icon: ShoppingBag, label: "Product Description Generator", desc: "Benefit-driven product copy that converts browsers into buyers.", color: "green", credits: 2 },
  { href: "/tools/youtube-description", icon: Youtube, label: "YouTube Description & Keywords", desc: "Optimized descriptions, keywords, and hashtags for better discoverability.", color: "red", credits: 2 },
  { href: "/tools/youtube-script", icon: Film, label: "YouTube Trending Script Generator", desc: "Full scripts with hook, intro, main content, CTA, and outro.", color: "orange", credits: 4 },
  { href: "/tools/code-assistant", icon: Code2, label: "Code Assistant", desc: "Clean, explained code solutions for any programming problem.", color: "purple", credits: 2 },
];

const gradients: Record<string, string> = {
  blue: "from-blue-500/15 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40",
  pink: "from-pink-500/15 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40",
  green: "from-green-500/15 to-green-600/5 border-green-500/20 hover:border-green-500/40",
  red: "from-red-500/15 to-red-600/5 border-red-500/20 hover:border-red-500/40",
  orange: "from-orange-500/15 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40",
  purple: "from-purple-500/15 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40",
};

const iconColors: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400",
  pink: "bg-pink-500/10 text-pink-400",
  green: "bg-green-500/10 text-green-400",
  red: "bg-red-500/10 text-red-400",
  orange: "bg-orange-500/10 text-orange-400",
  purple: "bg-purple-500/10 text-purple-400",
};

export default function ToolsMarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-28 hero-bg grid-overlay text-center px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-6">AI TOOLS</span>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
            6 Powerful AI Tools for <span className="gradient-text">Every Creator</span>
          </h1>
          <p className="text-gray-400 text-xl mb-10 leading-relaxed">
            From blog posts to YouTube scripts — generate professional content in seconds.
          </p>
          <Link href="/signup" className="btn-gradient inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-2xl shadow-blue-500/25 group">
            <Sparkles className="w-5 h-5" />
            Try All Tools Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.href} className={`group p-7 rounded-3xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${gradients[tool.color]}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${iconColors[tool.color]}`}>
                  <tool.icon className="w-7 h-7" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-3">{tool.label}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{tool.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{tool.credits} credit{tool.credits > 1 ? "s" : ""}</span>
                  </div>
                  <Link href={`/signup`} className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors group">
                    Use Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
