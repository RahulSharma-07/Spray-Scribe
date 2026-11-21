"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const tones = [
  "Persuasive", "Professional", "Friendly", "Luxurious", "Minimalist", "Bold",
  "Playful", "Trustworthy", "Exciting", "Warm", "Premium", "Casual",
  "Confident", "Empathetic", "Trendy",
];

const selectClass = "w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer";
const inputClass = "w-full px-4 py-3 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

export default function ProductDescriptionPage() {
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Persuasive");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const inputPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Product Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. Rose Gold Face Serum, Kids Lunch Box, Leather Wallet..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Key Features / Details <span className="text-red-400">*</span>
        </label>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows={4}
          placeholder={`What makes your product special? List features:\n- Lightweight & portable\n- 100% organic ingredients\n- Available in 5 colors\n- Perfect for daily use`}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Who is it for?</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. busy moms, college students, gift buyers..."
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
      <div className="p-3 rounded-xl bg-green-500/08 border border-green-500/15">
        <p className="text-xs font-semibold text-green-400 mb-1">🛍️ Works great for</p>
        <p className="text-xs text-gray-400">Amazon, Shopify, Etsy, Instagram shop, Meesho, Flipkart — any platform</p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolType="PRODUCT_DESCRIPTION"
      title="Product Description Generator"
      description="Write compelling product copy that converts browsers into buyers. 2 credits."
      icon={<ShoppingBag className="w-6 h-6 text-white" />}
      inputPanel={inputPanel}
      onGenerate={async () => {
        if (!productName.trim() || !features.trim()) throw new Error("Please fill in product name and features");
        return { input: { productName, features, audience, tone } };
      }}
      output={output}
      setOutput={setOutput}
      filename={`product-${productName.slice(0, 20).replace(/\s+/g, "-")}.txt`}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
    />
  );
}
