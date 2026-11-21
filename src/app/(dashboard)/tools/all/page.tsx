import Link from "next/link";
import { PenTool, Instagram, ShoppingBag, Youtube, Film, Code2, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Tools" };

const tools = [
  {
    href: "/tools/blog-generator",
    icon: PenTool,
    label: "Blog Generator",
    desc: "Create SEO-optimized blog posts with structured headings, compelling intros, and engaging content.",
    credits: 3,
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40",
    iconBg: "bg-blue-500/10 text-blue-400",
    badge: "Most Popular",
    badgeColor: "bg-blue-500/20 text-blue-300",
  },
  {
    href: "/tools/instagram-caption",
    icon: Instagram,
    label: "Instagram Caption Generator",
    desc: "Generate viral captions with trending hashtags that stop the scroll and boost engagement.",
    credits: 1,
    color: "from-pink-500/20 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40",
    iconBg: "bg-pink-500/10 text-pink-400",
    badge: "Best Value",
    badgeColor: "bg-pink-500/20 text-pink-300",
  },
  {
    href: "/tools/product-description",
    icon: ShoppingBag,
    label: "Product Description Generator",
    desc: "Write compelling product copy with benefit-focused bullets and strong calls-to-action.",
    credits: 2,
    color: "from-green-500/20 to-green-600/5 border-green-500/20 hover:border-green-500/40",
    iconBg: "bg-green-500/10 text-green-400",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/tools/youtube-description",
    icon: Youtube,
    label: "YouTube Description & Keywords",
    desc: "Get SEO-optimized descriptions, keyword tags, and hashtags all in one generation.",
    credits: 2,
    color: "from-red-500/20 to-red-600/5 border-red-500/20 hover:border-red-500/40",
    iconBg: "bg-red-500/10 text-red-400",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/tools/youtube-script",
    icon: Film,
    label: "YouTube Trending Script Generator",
    desc: "Full scripts with hook, intro, main content, engagement prompts, CTA, and outro.",
    credits: 4,
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40",
    iconBg: "bg-orange-500/10 text-orange-400",
    badge: "Premium",
    badgeColor: "bg-orange-500/20 text-orange-300",
  },
  {
    href: "/tools/code-assistant",
    icon: Code2,
    label: "Code Assistant",
    desc: "Solve coding problems with syntax-highlighted solutions and clear explanations.",
    credits: 2,
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40",
    iconBg: "bg-purple-500/10 text-purple-400",
    badge: null,
    badgeColor: "",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-2">AI Tools</h1>
        <p className="text-gray-400">Choose a tool and start generating content with AI</p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group relative p-6 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${tool.color}`}
          >
            {tool.badge && (
              <span className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                {tool.badge}
              </span>
            )}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${tool.iconBg}`}>
              <tool.icon className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-white text-lg mb-2 leading-tight">{tool.label}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{tool.desc}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tool.credits} credit{tool.credits > 1 ? "s" : ""} per generation</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                Use Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Credit info banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Running low on credits?</p>
            <p className="text-gray-400 text-xs">Upgrade to Pro for 100 credits/month and unlimited access</p>
          </div>
        </div>
        <Link href="/pricing" className="btn-gradient text-sm font-semibold text-white px-5 py-2.5 rounded-xl shadow-lg flex-shrink-0">
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
