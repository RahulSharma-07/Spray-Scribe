"use client";

import React, { useState } from "react";
import { Film } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const tones = [
  "Energetic", "Educational", "Entertaining", "Motivational", "Casual",
  "Professional", "Funny", "Storytelling", "Inspirational", "Trendy",
  "Bold", "Calm", "Hype", "Heartfelt", "Witty",
];
const videoTypes = [
  "Tutorial / How-To", "Vlog", "Product Review", "Listicle (Top 10 / Best of)", "Story Time",
  "Educational / Explainer", "React & Commentary", "Challenge", "Day in My Life", "Motivational Talk",
];
const lengths = [
  { value: "short", label: "Short (3-5 min)" },
  { value: "medium", label: "Medium (8-12 min)" },
  { value: "long", label: "Long (15-20 min)" },
];

const selectClass = "w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer";
const inputClass = "w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

export default function YoutubeScriptPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [videoType, setVideoType] = useState("Tutorial / How-To");
  const [tone, setTone] = useState("Energetic");
  const [length, setLength] = useState("medium");
  const [output, setOutput] = useState("");
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
          placeholder="e.g. I Tried 30 Days of Cold Showers – Here's What Happened"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Key Points to Cover <span className="text-red-400">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="What should the video cover? What are the main messages you want to get across?"
          className={`${inputClass} resize-none`}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Video Type</label>
          <select value={videoType} onChange={(e) => setVideoType(e.target.value)} className={selectClass}>
            {videoTypes.map((t) => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={selectClass}>
            {tones.map((t) => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Script Length</label>
        <div className="grid grid-cols-3 gap-2">
          {lengths.map((l) => (
            <button
              key={l.value}
              onClick={() => setLength(l.value)}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                length === l.value
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                  : "bg-white/05 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolType="YOUTUBE_SCRIPT"
      title="YouTube Script Generator"
      description="Full video scripts with hook, intro, main content, CTA & outro. 4 credits."
      icon={<Film className="w-6 h-6 text-white" />}
      inputPanel={inputPanel}
      onGenerate={async () => {
        if (!title.trim() || !topic.trim()) throw new Error("Please fill in the title and key points");
        return { input: { title, topic, videoType, tone, length } };
      }}
      output={output}
      setOutput={setOutput}
      filename={`script-${title.slice(0, 20).replace(/\s+/g, "-")}.txt`}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  );
}
