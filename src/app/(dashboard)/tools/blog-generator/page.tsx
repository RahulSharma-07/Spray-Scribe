"use client";

import { useState } from "react";
import { PenTool } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const tones = [
  "Professional", "Casual", "Friendly", "Authoritative", "Conversational",
  "Humorous", "Inspirational", "Storytelling", "Informative", "Persuasive",
  "Empathetic", "Bold", "Poetic", "Witty", "Serious",
];
const lengths = [
  { value: "short", label: "Short (400-600 words)" },
  { value: "medium", label: "Medium (800-1200 words)" },
  { value: "long", label: "Long (1500-2000 words)" },
];
const languages = ["English", "Hindi", "Spanish", "French", "German", "Portuguese", "Italian", "Arabic"];

const selectClass = "w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer";
const inputClass = "w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/08 transition-all text-sm";

export default function BlogGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("medium");
  const [language, setLanguage] = useState("English");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const inputPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Blog Topic <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. 10 healthy breakfast ideas for busy mornings"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={selectClass}>
            {tones.map((t) => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Length</label>
          <select value={length} onChange={(e) => setLength(e.target.value)} className={selectClass}>
            {lengths.map((l) => <option key={l.value} value={l.value} className="bg-gray-900">{l.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
          {languages.map((l) => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
        </select>
      </div>

      <div className="p-3 rounded-xl bg-blue-500/08 border border-blue-500/15">
        <p className="text-xs font-semibold text-blue-400 mb-1.5">💡 Tips for better results</p>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>Be specific — "5 tips for stress-free travel" beats "travel tips"</li>
          <li>Mention your target reader in the topic</li>
          <li>Pick a tone that matches your brand voice</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolType="BLOG_GENERATOR"
      title="Blog Generator"
      description="Generate SEO-optimized blog posts on any topic in seconds. 3 credits."
      icon={<PenTool className="w-6 h-6 text-white" />}
      inputPanel={inputPanel}
      onGenerate={async () => {
        if (!topic.trim()) throw new Error("Please enter a blog topic");
        return { input: { topic, tone, length, language } };
      }}
      output={output}
      setOutput={setOutput}
      filename={`blog-${topic.slice(0, 20).replace(/\s+/g, "-")}.txt`}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  );
}
