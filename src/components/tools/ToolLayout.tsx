"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Download, RefreshCw, Loader2, Sparkles,
  CheckCircle2, AlertCircle, ChevronRight, TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard, downloadAsText, TOOL_CREDITS } from "@/lib/utils";
import Link from "next/link";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Magnetic } from "@/components/ui/magnetic";

interface ToolLayoutProps {
  toolType: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  inputPanel: React.ReactNode;
  onGenerate: () => Promise<{ input: Record<string, unknown> }>;
  output: string;
  setOutput: (v: string) => void;
  filename?: string;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

// ── SEO Score Engine ────────────────────────────────────────────────────────
// NOTE: This scores content quality signals we can verify from text.
// It is NOT a replication of VidIQ/TubeBuddy — those measure search volume,
// competition, and channel authority which require YouTube API access.
// A score of 80 here means the content has all the structural elements
// that good YouTube SEO descriptions should have.
interface ScoreBreakdown {
  label: string;
  earned: number;
  max: number;
  passed: boolean;
}

function computeSeoScore(output: string, toolType: string): {
  score: number;
  grade: string;
  color: string;
  breakdown: ScoreBreakdown[];
} {
  if (!output) return { score: 0, grade: "—", color: "text-gray-500", breakdown: [] };

  const breakdown: ScoreBreakdown[] = [];

  if (toolType === "YOUTUBE_DESCRIPTION") {

    // 1. Hook / first-line keyword placement — 20 pts
    // Extract everything before Section 2
    const hookMatch = output.match(/SECTION 1[^\n]*\n([\s\S]*?)(?=SECTION 2|═{4,})/i);
    const hookText  = (hookMatch?.[1] ?? output.slice(0, 400)).trim();
    const hookLines = hookText.split("\n").filter(l => l.trim().length > 3);
    // Good hook: at least 2 non-empty lines, first line is 8+ words
    const firstLineWords = (hookLines[0] ?? "").split(/\s+/).filter(Boolean).length;
    const hookPts =
      hookLines.length >= 3 && firstLineWords >= 8  ? 20 :
      hookLines.length >= 2 && firstLineWords >= 5  ? 13 :
      hookLines.length >= 1 && firstLineWords >= 3  ? 7  : 0;
    breakdown.push({
      label: `Hook quality (${hookLines.length} lines)`,
      earned: hookPts, max: 20,
      passed: hookPts >= 13,
    });

    // 2. Description body length — 20 pts
    const bodyMatch =
      output.match(/SECTION 2[^\n]*\n([\s\S]*?)(?=SECTION 3)/i) ??
      output.match(/SECTION 2[^\n]*\n([\s\S]*?)(?=═{4,})/i)      ??
      output.match(/📺[^\n]*\n([\s\S]*?)(?=⏱️|SECTION 3|═{4,})/i);
    const body      = bodyMatch?.[1]?.trim() ?? "";
    const bodyWords = body.split(/\s+/).filter(Boolean).length;
    const lenPts =
      bodyWords >= 350 ? 20 :
      bodyWords >= 220 ? 15 :
      bodyWords >= 140 ? 9  :
      bodyWords >= 70  ? 4  : 0;
    breakdown.push({
      label: `Description body (${bodyWords} words)`,
      earned: lenPts, max: 20,
      passed: bodyWords >= 180,
    });

    // 3. Hashtag count — 15 pts (YouTube best practice: 3–15)
    const hashCount = (output.match(/#[a-zA-Z]\w*/g) ?? []).length;
    const hashPts   =
      hashCount >= 10 ? 15 :
      hashCount >= 5  ? 10 :
      hashCount >= 2  ? 5  : 0;
    breakdown.push({
      label: `Hashtags (${hashCount} found)`,
      earned: hashPts, max: 15,
      passed: hashCount >= 8,
    });

    // 4. SEO tags — 20 pts
    const tagSecMatch =
      output.match(/SECTION 5[^\n]*\n([\s\S]*?)(?=SECTION 6|═{4,}|$)/i) ??
      output.match(/🏷️[^\n]*\n([\s\S]*?)(?=SECTION 6|═{4,}|#[a-zA-Z])/i);
    const tagRaw   = tagSecMatch?.[1] ?? "";
    const tagCount = tagRaw.split(",").filter(t => t.trim().replace(/[\n\r]/g, "").length > 2).length;
    const tagPts   =
      tagCount >= 25 ? 20 :
      tagCount >= 15 ? 14 :
      tagCount >= 8  ? 8  :
      tagCount >= 3  ? 3  : 0;
    breakdown.push({
      label: `SEO tags (${tagCount} found)`,
      earned: tagPts, max: 20,
      passed: tagCount >= 15,
    });

    // 5. Timestamps — 10 pts
    const tsCount = new Set(output.match(/\b\d{1,2}:\d{2}\b/g) ?? []).size;
    const tsPts   =
      tsCount >= 6 ? 10 :
      tsCount >= 3 ? 6  :
      tsCount >= 1 ? 3  : 0;
    breakdown.push({
      label: `Timestamps (${tsCount} found)`,
      earned: tsPts, max: 10,
      passed: tsCount >= 5,
    });

    // 6. CTA completeness — 10 pts
    const hasSub  = /subscri/i.test(output);
    const hasLike = /\blike\b/i.test(output);
    const hasBell = /bell|notif/i.test(output);
    const ctaPts  = (hasSub ? 4 : 0) + (hasLike ? 3 : 0) + (hasBell ? 3 : 0);
    breakdown.push({
      label: `CTA: sub(${hasSub?"✓":"✗"}) like(${hasLike?"✓":"✗"}) bell(${hasBell?"✓":"✗"})`,
      earned: ctaPts, max: 10,
      passed: ctaPts >= 7,
    });

    // 7. Links section — 5 pts
    const hasLinks = /subscribe.*?\[|instagram.*?\[|twitter.*?\[/i.test(output);
    breakdown.push({
      label: "Links section",
      earned: hasLinks ? 5 : 0, max: 5,
      passed: hasLinks,
    });

  } else if (toolType === "BLOG_GENERATOR") {

    const wordCount = output.split(/\s+/).filter(Boolean).length;
    const lenPts = wordCount >= 900 ? 25 : wordCount >= 500 ? 17 : wordCount >= 250 ? 9 : 2;
    breakdown.push({ label: `Word count (${wordCount})`, earned: lenPts, max: 25, passed: lenPts >= 17 });
    const h2count = (output.match(/^#{1,3}\s/gm) ?? []).length;
    const headPts = h2count >= 3 ? 20 : h2count >= 2 ? 13 : h2count >= 1 ? 6 : 0;
    breakdown.push({ label: `Headings (${h2count})`, earned: headPts, max: 20, passed: h2count >= 2 });
    const hasCta = /click|subscribe|sign up|get started|learn more|read more|download/i.test(output);
    breakdown.push({ label: "Call to action", earned: hasCta ? 20 : 0, max: 20, passed: hasCta });
    const hasIntro = /introduc|overview|in this|today|welcome/i.test(output.slice(0, 600));
    breakdown.push({ label: "Introduction", earned: hasIntro ? 15 : 4, max: 15, passed: hasIntro });
    const hasConcl = /conclusion|summary|final|wrapping|to sum|in short/i.test(output);
    breakdown.push({ label: "Conclusion", earned: hasConcl ? 20 : 0, max: 20, passed: hasConcl });

  } else if (toolType === "INSTAGRAM_CAPTION") {

    const hashCount = (output.match(/#[a-zA-Z]\w*/g) ?? []).length;
    const hashPts = hashCount >= 7 ? 30 : hashCount >= 4 ? 20 : hashCount >= 1 ? 8 : 0;
    breakdown.push({ label: `Hashtags (${hashCount})`, earned: hashPts, max: 30, passed: hashCount >= 5 });
    const hasEmoji = /[\u{1F300}-\u{1FFFF}]/u.test(output);
    breakdown.push({ label: "Emojis", earned: hasEmoji ? 25 : 0, max: 25, passed: hasEmoji });
    const hasCta = /comment|dm|link in bio|click|follow|share|tag/i.test(output);
    breakdown.push({ label: "Engagement CTA", earned: hasCta ? 25 : 0, max: 25, passed: hasCta });
    const charCount = output.length;
    const inRange = charCount >= 60 && charCount <= 2200;
    breakdown.push({ label: `Length (${charCount} chars)`, earned: inRange ? 20 : 5, max: 20, passed: inRange });

  } else if (toolType === "PRODUCT_DESCRIPTION") {

    const hasBullets = /[✓•]/.test(output) || (output.match(/^[-*]\s/gm) ?? []).length >= 2;
    breakdown.push({ label: "Bullet / feature list", earned: hasBullets ? 25 : 5, max: 25, passed: hasBullets });
    const hasCta = /\b(buy|order|shop|get yours|add to cart|purchase|grab)\b/i.test(output);
    breakdown.push({ label: "Purchase CTA", earned: hasCta ? 25 : 2, max: 25, passed: hasCta });
    const wordCount = output.split(/\s+/).filter(Boolean).length;
    const lenPts = wordCount >= 150 ? 25 : wordCount >= 80 ? 15 : wordCount >= 40 ? 8 : 2;
    breakdown.push({ label: `Word count (${wordCount})`, earned: lenPts, max: 25, passed: lenPts >= 15 });
    const hasHeadline = /^#{1,2}\s\S|^\*\*[A-Z]/m.test(output);
    breakdown.push({ label: "Product headline", earned: hasHeadline ? 25 : 5, max: 25, passed: hasHeadline });

  } else {

    const wordCount = output.split(/\s+/).filter(Boolean).length;
    const lenPts = wordCount >= 150 ? 50 : wordCount >= 80 ? 30 : wordCount >= 40 ? 15 : 5;
    breakdown.push({ label: `Content length (${wordCount} words)`, earned: lenPts, max: 50, passed: lenPts >= 30 });
    const hasStructure = /#{1,3}\s|\n[-*]\s|\n\d+\.\s/m.test(output);
    breakdown.push({ label: "Structured output", earned: hasStructure ? 50 : 15, max: 50, passed: hasStructure });
  }

  const total    = breakdown.reduce((s, b) => s + b.earned, 0);
  const maxTotal = breakdown.reduce((s, b) => s + b.max, 0);
  const score    = Math.round((total / maxTotal) * 100);

  const grade =
    score >= 90 ? "A+" :
    score >= 80 ? "A"  :
    score >= 70 ? "B"  :
    score >= 60 ? "C"  : "D";

  const color =
    score >= 80 ? "text-green-400"  :
    score >= 65 ? "text-yellow-400" :
    score >= 50 ? "text-orange-400" : "text-red-400";

  return { score, grade, color, breakdown };
}

// ── SEO Badge Component ──────────────────────────────────────────────────────
function SeoBadge({ output, toolType }: { output: string; toolType: string }) {
  const [open, setOpen] = useState(false);
  const { score, grade, color, breakdown } = useMemo(
    () => computeSeoScore(output, toolType),
    [output, toolType]
  );

  if (!output) return null;

  const ringColor =
    score >= 80 ? "stroke-green-400"  :
    score >= 65 ? "stroke-yellow-400" :
    score >= 50 ? "stroke-orange-400" : "stroke-red-400";

  const bgColor =
    score >= 80 ? "bg-green-500/10 border-green-500/20"  :
    score >= 65 ? "bg-yellow-500/10 border-yellow-500/20" :
    score >= 50 ? "bg-orange-500/10 border-orange-500/20" : "bg-red-500/10 border-red-500/20";

  const circumference = 2 * Math.PI * 20;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${bgColor} ${color}`}
        title="Content quality score — structure, length, tags & CTA"
      >
        {/* Mini ring */}
        <svg width="22" height="22" className="-rotate-90">
          <circle cx="11" cy="11" r="8" strokeWidth="2.5" stroke="rgba(255,255,255,0.08)" fill="none" />
          <circle
            cx="11" cy="11" r="8" strokeWidth="2.5" fill="none"
            className={ringColor}
            strokeDasharray={`${(score / 100) * (2 * Math.PI * 8)} ${2 * Math.PI * 8}`}
            strokeLinecap="round"
          />
        </svg>
        SEO {score}
        <TrendingUp className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-72 max-w-[calc(100vw-2rem)] bg-[#0d1120] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/08 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">SEO Score</p>
                <p className="text-gray-500 text-xs">Based on content quality signals</p>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-black ${color}`}>{score}</div>
                <div className={`text-xs font-bold ${color}`}>{grade}</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="px-4 pt-3 pb-1">
              <div className="w-full bg-white/08 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    score >= 80 ? "bg-green-400" :
                    score >= 65 ? "bg-yellow-400" :
                    score >= 50 ? "bg-orange-400" : "bg-red-400"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>0</span><span>50</span><span>100</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="px-4 pb-4 space-y-2 mt-1">
              {breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center ${b.passed ? "bg-green-500/20" : "bg-red-500/20"}`}>
                      {b.passed
                        ? <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                        : <AlertCircle  className="w-2.5 h-2.5 text-red-400" />}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{b.label}</span>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${b.passed ? "text-green-400" : "text-red-400"}`}>
                    {b.earned}/{b.max}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="px-4 pb-3">
              <p className="text-[10px] text-gray-500 text-center">
                Content quality score — checks structure, length, tags & CTA.<br/>
                <span className="text-gray-600">Not a replication of VidIQ/TubeBuddy.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ToolLayout ──────────────────────────────────────────────────────────
export function ToolLayout({
  toolType, title, description, icon,
  inputPanel, onGenerate, output, setOutput,
  filename = "content.txt", isGenerating, setIsGenerating,
}: ToolLayoutProps) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [liveCredits, setLiveCredits] = useState<number | null>(null);

  const sessionCredits = (session?.user as any)?.credits ?? 0;
  const credits = liveCredits ?? sessionCredits;
  const cost = TOOL_CREDITS[toolType] ?? 1;

  useEffect(() => {
    fetch("/api/user/credits")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setLiveCredits(data.credits); })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    let currentCredits = credits;
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        currentCredits = data.credits;
        setLiveCredits(data.credits);
      }
    } catch { /* fall back */ }

    if (currentCredits < cost) {
      toast.error(`You need ${cost} credits. You have ${currentCredits}. Please upgrade!`);
      return;
    }
    setIsGenerating(true);
    setSavedId(null);
    try {
      const { input } = await onGenerate();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolType, input }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Generation failed"); return; }
      setOutput(data.output);
      setSavedId(data.contentId);
      setLiveCredits(data.creditsRemaining);
      toast.success(`Content generated! ${cost} credit${cost > 1 ? "s" : ""} used.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadAsText(output, filename);
    toast.success("Downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl btn-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-white">{title}</h1>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full glass border border-white/10 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">{credits}</span>
            <span className="text-gray-400">credits</span>
          </div>
          <div className="px-3 py-1.5 rounded-full glass border border-blue-500/20 text-xs text-blue-400">
            {cost} credit{cost > 1 ? "s" : ""} per generation
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: Input Panel ── */}
        <div className="glass rounded-2xl border border-white/08 p-6 flex flex-col gap-5">
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            Input Details
          </h2>

          {inputPanel}

          <div className="mt-auto pt-4 border-t border-white/08">
            {credits < cost && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-3 text-sm text-orange-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Not enough credits. <Link href="/upgrade" className="underline font-medium">Upgrade your plan</Link></span>
              </div>
            )}
            <Magnetic>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || credits < cost}
                id="generate-btn"
                className="w-full btn-gradient py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-teal-500/20 transition-all"
              >
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> GENERATING...</>
                  : <><Sparkles className="w-4 h-4" /> GENERATE CONTENT</>}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* ── RIGHT: Output Panel ── */}
        <div className="glass rounded-2xl border border-white/08 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
              Generated Output
            </h2>
            <div className="flex items-center gap-2">
              {/* SEO Score badge — shown whenever there's output */}
              <SeoBadge output={output} toolType={toolType} />

              {output && (
                <>
                  <button onClick={handleGenerate} disabled={isGenerating || credits < cost} title="Regenerate"
                    className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all disabled:opacity-40">
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  </button>
                  <button onClick={handleCopy} title="Copy"
                    className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={handleDownload} title="Download"
                    className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 rounded-xl bg-black/30 border border-white/08 min-h-[420px] flex flex-col">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-h-[420px] flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium text-sm">AI is generating your content</p>
                    <p className="text-gray-500 text-xs mt-1">This may take a few seconds...</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              ) : output ? (
                <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: "65vh" }}>
                  <MarkdownRenderer content={output} isCode={toolType === "CODE_ASSISTANT"} />
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-h-[420px] flex flex-col items-center justify-center gap-3 text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/04 border border-white/08 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Your content will appear here</p>
                    <p className="text-gray-600 text-sm mt-1">Fill in the details and click Generate</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {savedId && !isGenerating && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved to your content library</span>
              <Link href="/library" className="ml-auto text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                View <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
