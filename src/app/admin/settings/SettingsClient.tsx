"use client";

import { useState } from "react";
import { SystemSettings } from "@prisma/client";
import { updateSystemSettings } from "./actions";
import { toast } from "react-hot-toast";

type FormState = Omit<SystemSettings, "createdAt" | "updatedAt">;

export default function SettingsClient({ initialSettings }: { initialSettings: SystemSettings | null }) {
  const [formData, setFormData] = useState<FormState>({
    id: "default",
    appName: initialSettings?.appName ?? "Spray Scribe",
    appLogo: initialSettings?.appLogo ?? "",
    openaiKey: initialSettings?.openaiKey ?? "",
    anthropicKey: initialSettings?.anthropicKey ?? "",
    rateLimitPerHour: initialSettings?.rateLimitPerHour ?? 100,
    creditCostPerGeneration: initialSettings?.creditCostPerGeneration ?? 5,
    maintenanceMode: initialSettings?.maintenanceMode ?? false,
    allowSignups: initialSettings?.allowSignups ?? true,
    emailNotifications: initialSettings?.emailNotifications ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings(formData);
      toast.success("Settings updated successfully!");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in">
      
      {/* General Settings */}
      <div className="bg-white/05 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">General Platform Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Application Name</label>
            <input 
              type="text" 
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
              value={formData.appName} 
              onChange={e => setFormData({ ...formData, appName: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">App Logo URL</label>
            <input 
              type="url" 
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
              value={formData.appLogo || ""} 
              onChange={e => setFormData({ ...formData, appLogo: e.target.value })} 
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer p-4 bg-black/20 rounded-xl border border-white/05">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-blue-500" 
                checked={formData.allowSignups} 
                onChange={e => setFormData({ ...formData, allowSignups: e.target.checked })} 
              />
              Allow New Signups
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer p-4 bg-black/20 rounded-xl border border-white/05">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-blue-500" 
                checked={formData.emailNotifications} 
                onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })} 
              />
              Send Email Notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-red-400 cursor-pointer p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-red-500" 
                checked={formData.maintenanceMode} 
                onChange={e => setFormData({ ...formData, maintenanceMode: e.target.checked })} 
              />
              Maintenance Mode
            </label>
          </div>
        </div>
      </div>

      {/* API & LLM Config */}
      <div className="bg-white/05 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">API & LLM Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Default OpenAI API Key</label>
            <input 
              type="password" 
              placeholder="sk-..."
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
              value={formData.openaiKey || ""} 
              onChange={e => setFormData({ ...formData, openaiKey: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Anthropic API Key (Optional fallback)</label>
            <input 
              type="password" 
              placeholder="sk-ant-..."
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
              value={formData.anthropicKey || ""} 
              onChange={e => setFormData({ ...formData, anthropicKey: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Global Default Credit Cost</label>
            <input 
              type="number" 
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
              value={isNaN(formData.creditCostPerGeneration) ? "" : formData.creditCostPerGeneration} 
              onChange={e => setFormData({ ...formData, creditCostPerGeneration: parseInt(e.target.value) })} 
            />
            <p className="text-xs text-gray-500 mt-1">Cost deducted per standard AI generation.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rate Limit Per Hour</label>
            <input 
              type="number" 
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
              value={isNaN(formData.rateLimitPerHour) ? "" : formData.rateLimitPerHour} 
              onChange={e => setFormData({ ...formData, rateLimitPerHour: parseInt(e.target.value) })} 
            />
            <p className="text-xs text-gray-500 mt-1">Maximum API requests allowed per user/hr.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          type="button" 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-white/05 hover:bg-white/10 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={saving}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

    </form>
  );
}
