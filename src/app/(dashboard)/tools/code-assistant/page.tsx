"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const languages = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "Bash", "HTML/CSS", "React", "Next.js", "Other"];
const complexities = ["Beginner", "Intermediate", "Advanced"];

export default function CodeAssistantPage() {
  const [problem, setProblem] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [complexity, setComplexity] = useState("Intermediate");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const inputPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Problem / Question <span className="text-red-400">*</span></label>
        <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={5}
          placeholder="Describe your coding problem or question in detail...&#10;&#10;e.g. How do I implement a debounce function in JavaScript? Or: Write a function to reverse a linked list in Python."
          className="w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm resize-none font-mono" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Programming Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer">
            {languages.map((l) => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Complexity Level</label>
          <div className="grid grid-cols-3 gap-1.5">
            {complexities.map((c) => (
              <button key={c} onClick={() => setComplexity(c)}
                className={`py-3 rounded-xl text-xs font-medium border transition-all ${complexity === c ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "glass border-white/10 text-gray-400 hover:border-white/20 hover:text-white"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-purple-500/08 border border-purple-500/15">
        <p className="text-xs font-semibold text-purple-400 mb-1">💻 Output Includes</p>
        <p className="text-xs text-gray-400">Clean code + step-by-step explanation + key concepts + optimization tips</p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolType="CODE_ASSISTANT"
      title="Code Assistant"
      description="Get clean, explained code solutions for any programming problem. 2 credits."
      icon={<Code2 className="w-6 h-6 text-white" />}
      inputPanel={inputPanel}
      onGenerate={async () => {
        if (!problem.trim()) throw new Error("Please describe your coding problem");
        return { input: { problem, language, complexity } };
      }}
      output={output}
      setOutput={setOutput}
      filename={`code-${language.toLowerCase()}-solution.txt`}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  );
}
