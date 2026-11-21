"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Lock, Key, CreditCard, Save, Loader2, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "api", label: "API Key", icon: Key },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPasses, setShowPasses] = useState({ current: false, new: false, confirm: false });
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const user = session?.user as any;
  const [liveProfile, setLiveProfile] = useState<{ credits?: number; plan?: string; role?: string } | null>(null);

  // Merge live DB data over stale session token
  const credits = liveProfile?.credits ?? user?.credits ?? 0;
  const plan = liveProfile?.plan ?? user?.plan ?? "FREE";
  const role = liveProfile?.role ?? user?.role ?? "USER";

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey ?? "");
        // Set name and email from DB — single source of truth
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
      }
    };
    // Also fetch live credits/plan/role from DB so admin changes reflect immediately
    const fetchLive = async () => {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setLiveProfile(data);
        // Sync session token so other parts of UI update too
        try { await update({ credits: data.credits, plan: data.plan, role: data.role }); } catch { /* ignore */ }
      }
    };
    fetchProfile();
    fetchLive();
  }, [update]);

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        toast.success("Profile updated!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) { toast.error("All fields are required"); return; }
    if (newPass !== confirmPass) { toast.error("New passwords don't match"); return; }
    if (newPass.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurrentPass(""); setNewPass(""); setConfirmPass("");
      } else {
        toast.error(data.error ?? "Failed to change password");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleCopyApiKey = async () => {
    await copyToClipboard(apiKey);
    setCopiedKey(true);
    toast.success("API key copied!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm("Regenerate API key? Your current key will stop working.")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok) { setApiKey(data.apiKey); toast.success("New API key generated!"); }
      else { toast.error("Failed to regenerate key"); }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all text-sm";

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl font-black text-white">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl glass border border-white/10 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="glass rounded-2xl border border-white/08 p-6"
      >
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl text-white">Profile Information</h2>
            <div className="flex items-center gap-4 pb-4 border-b border-white/08">
              <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center text-xl font-black shadow-lg">
                {name.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-gray-400">{email}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 mt-1 inline-block">
                  {plan} Plan
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ml-1 inline-block ${
                  role === "ADMIN" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                }`}>
                  {role}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input type="email" value={email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="btn-gradient px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl text-white">Change Password</h2>
            {[
              { label: "Current Password", value: currentPass, setter: setCurrentPass, key: "current" as const },
              { label: "New Password", value: newPass, setter: setNewPass, key: "new" as const },
              { label: "Confirm New Password", value: confirmPass, setter: setConfirmPass, key: "confirm" as const },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{field.label}</label>
                <div className="relative">
                  <input type={showPasses[field.key] ? "text" : "password"} value={field.value}
                    onChange={(e) => field.setter(e.target.value)} placeholder="••••••••"
                    className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPasses((p) => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPasses[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={saving}
              className="btn-gradient px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </div>
        )}

        {/* API Key Tab */}
        {activeTab === "api" && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl text-white">API Key</h2>
            <p className="text-sm text-gray-400">Use your API key to access Spray Scribe programmatically.</p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Your API Key</label>
              <div className="relative flex gap-2">
                <input type={showApiKey ? "text" : "password"} value={apiKey} readOnly
                  className={`${inputClass} font-mono pr-12 flex-1`} />
                <button onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={handleCopyApiKey}
                  className="flex-shrink-0 px-4 py-3 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all flex items-center gap-2 text-sm">
                  {copiedKey ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedKey ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/08 border border-orange-500/15">
              <p className="text-xs text-orange-300">⚠️ Keep your API key secret. Don't share it publicly.</p>
            </div>
            <button onClick={handleRegenerateApiKey} disabled={saving}
              className="px-6 py-2.5 rounded-xl glass border border-white/15 hover:border-white/30 text-gray-300 hover:text-white text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Regenerate Key
            </button>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl text-white">Subscription</h2>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <p className="text-2xl font-black text-white capitalize">{plan}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan === "FREE" ? "bg-gray-500/20 text-gray-400" : "bg-green-500/20 text-green-400"}`}>
                  {plan === "FREE" ? "Free Tier" : "Active"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Credits Remaining</p>
                  <p className="font-bold text-white">{credits}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Monthly Allocation</p>
                  <p className="font-bold text-white">{plan === "FREE" ? "10" : plan === "PRO" ? "100" : "500"}</p>
                </div>
              </div>
            </div>
            {plan === "FREE" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Upgrade to get more credits and features:</p>
                <a href="/upgrade" className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm shadow-lg">
                  <CreditCard className="w-4 h-4" />
                  Upgrade to Pro — ₹50/month
                </a>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
