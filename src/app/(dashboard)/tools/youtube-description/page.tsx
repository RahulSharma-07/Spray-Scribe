"use client";

import React, { useState } from "react";
import { Youtube } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const tones = [
  "Educational", "Entertaining", "Professional", "Casual", "Inspirational",
  "Funny", "Storytelling", "Motivational", "Energetic", "Calm & Informative",
  "Trendy", "Heartfelt", "Bold", "Friendly", "Hype",
];

const descLengths = [
  { value: "short",    label: "Short",    chars: "~1500 chars", detail: "Quick & punchy" },
  { value: "standard", label: "Standard", chars: "~3000 chars", detail: "Balanced & complete" },
  { value: "detailed", label: "Detailed", chars: "~5000 chars", detail: "Max SEO coverage" },
];

const selectClass = "w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer";
const inputClass  = "w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

export default function YoutubeDescriptionPage() {
  const [title,       setTitle]       = useState("");
  const [topic,       setTopic]       = useState("");
  const [audience,    setAudience]    = useState("");
  const [tone,        setTone]        = useState("Educational");
  const [descLength,  setDescLength]  = useState("standard");
  const [output,      setOutput]      = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const inputPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Video Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. I Tried Eating Only Fruits for 7 Days — Here's What Happened"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          What is your video about? <span className="text-red-400">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="Briefly describe what your video covers, the main points, and what viewers will learn or enjoy..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Description Length Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description Length
        </label>
        <div className="grid grid-cols-3 gap-2">
          {descLengths.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDescLength(opt.value)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                descLength === opt.value
                  ? "bg-blue-500/15 border-blue-500/50 text-blue-300"
                  : "bg-white/03 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span className="font-bold">{opt.label}</span>
              <span className={`text-[10px] font-normal ${descLength === opt.value ? "text-blue-400/80" : "text-gray-600"}`}>{opt.chars}</span>
              <span className={`text-[9px] font-normal ${descLength === opt.value ? "text-blue-400/60" : "text-gray-700"}`}>{opt.detail}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Who is this for?</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. busy moms, students..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={selectClass}>
            {tones.map((t) => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
          </select>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-red-500/08 border border-red-500/15">
        <p className="text-xs font-semibold text-red-400 mb-1">📺 What you'll get</p>
        <p className="text-xs text-gray-400">Hook · Description body · Timestamps · Links · 30 SEO tags · 20 hashtags</p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolType="YOUTUBE_DESCRIPTION"
      title="YouTube Description & Keyword Generator"
      description="SEO-optimized descriptions, keywords & hashtags for any video. 2 credits."
      icon={<Youtube className="w-6 h-6 text-white" />}
      inputPanel={inputPanel}
      onGenerate={async () => {
        if (!title.trim() || !topic.trim()) throw new Error("Please fill in the title and video topic");
        return { input: { title, topic, audience, tone, descLength } };
      }}
      output={output}
      setOutput={setOutput}
      filename={`youtube-desc-${title.slice(0, 20).replace(/\s+/g, "-")}.txt`}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  );
}
