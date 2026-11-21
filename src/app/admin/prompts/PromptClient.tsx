"use client";

import { useState } from "react";
import { Prompt, ToolType } from "@prisma/client";
import { upsertPrompt, togglePromptStatus } from "./actions";
import { Edit2, Power, PowerOff, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

const TOOL_TYPES = [
  "BLOG_GENERATOR", "INSTAGRAM_CAPTION", "PRODUCT_DESCRIPTION", 
  "YOUTUBE_DESCRIPTION", "YOUTUBE_SCRIPT", "CODE_ASSISTANT"
];

export default function PromptClient({ initialPrompts }: { initialPrompts: Prompt[] }) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [editing, setEditing] = useState<ToolType | null>(null);
  
  const [formData, setFormData] = useState({
    toolType: "BLOG_GENERATOR" as ToolType,
    name: "", description: "", template: "", variables: "[]"
  });

  const handleEdit = (prompt?: Prompt, defaultType?: ToolType) => {
    if (prompt) {
      setFormData({
        toolType: prompt.toolType,
        name: prompt.name,
        description: prompt.description || "",
        template: prompt.template,
        variables: JSON.stringify(prompt.variables, null, 2)
      });
      setEditing(prompt.toolType);
    } else if (defaultType) {
      setFormData({
        toolType: defaultType,
        name: "", description: "", template: "", variables: "[]"
      });
      setEditing(defaultType);
    }
  };

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertPrompt(formData);
      toast.success("Prompt saved!");
      setEditing(null);
      // Wait for revalidate or refresh
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to save prompt. Check JSON format.");
    }
  };

  return (
    <div className="space-y-6">
      {editing ? (
        <form onSubmit={handleUpsert} className="bg-white/05 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400"/> Editing: {formData.toolType}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Name *</label>
              <input required type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">Prompt Template *</label>
              <textarea required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white h-32 font-mono text-sm" 
                value={formData.template} onChange={e => setFormData({...formData, template: e.target.value})} />
              <p className="text-xs text-gray-500 mt-1">Use variable placeholders if needed (e.g., {"{{topic}}"})</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">Variables (JSON Array)</label>
              <textarea required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white h-24 font-mono text-sm" 
                value={formData.variables} onChange={e => setFormData({...formData, variables: e.target.value})} />
              <p className="text-xs text-gray-500 mt-1">Example: ["topic", "tone", "keywords"]</p>
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Save Prompt Configuration
          </button>
        </form>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOOL_TYPES.map((type) => {
          const prompt = prompts.find(p => p.toolType === type);
          return (
            <div key={type} className="bg-white/05 border border-white/10 rounded-2xl p-5 space-y-4 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">{type.replace(/_/g, " ")}</h3>
                {prompt?.isActive ? (
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full">Active</span>
                ) : (
                  <span className="bg-gray-500/10 text-gray-400 text-xs px-2 py-1 rounded-full">{prompt ? "Disabled" : "Not Configured"}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 h-8 line-clamp-2">
                {prompt?.description || "No description configured."}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button 
                  onClick={() => handleEdit(prompt, type as ToolType)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  <Edit2 size={14}/> {prompt ? "Edit Prompt" : "Configure"}
                </button>
                {prompt && (
                  <button 
                    onClick={async () => {
                      await togglePromptStatus(prompt.id, !prompt.isActive);
                      setPrompts(prompts.map(p => p.id === prompt.id ? { ...p, isActive: !p.isActive } : p));
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${prompt.isActive ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10" : "text-green-400 hover:bg-green-500/10"}`}
                  >
                    {prompt.isActive ? <PowerOff size={16}/> : <Power size={16}/>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
