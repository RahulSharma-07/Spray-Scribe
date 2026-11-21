"use client";

import { useState } from "react";
import { Image } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const tones = [
  "Funny", "Motivational", "Trendy", "Professional", "Casual", "Inspirational",
  "Romantic", "Bold", "Witty", "Aesthetic", "Sarcastic", "Empowering",
  "Chill", "Hype", "Heartfelt",
];

const selectClass = "w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer";
const inputClass = "w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

export default function InstagramCaptionPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Trendy");
  const [audience, setAudience] = useState("");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const inputPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Topic / Idea <span className="text-red-400">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Sunset beach day, launching my skincare brand, Monday motivation, travel in Paris..."
          className={`${inputClass} resize-none`}
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
          <label className="block text-sm font-medium text-gray-300 mb-1.5">No. of Captions</label>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className={selectClass}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n} className="bg-gray-900">{n} caption{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Target Audience <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="e.g. women 18-35, fitness lovers, food enthusiasts, small business owners..."
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolType="INSTAGRAM_CAPTION"
      title="Instagram Caption Generator"
      description="Create viral-worthy captions with hashtags that stop the scroll. 1 credit."
      icon={<Image className="w-6 h-6 text-white" />}
      inputPanel={inputPanel}
      onGenerate={async () => {
        if (!topic.trim()) throw new Error("Please enter a topic or idea");
        return { input: { topic, tone, audience, count } };
      }}
      output={output}
      setOutput={setOutput}
      filename="instagram-captions.txt"
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  );
}
