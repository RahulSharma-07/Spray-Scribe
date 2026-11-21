"use client";

import { useState, useTransition } from "react";
import { Megaphone, Plus, Trash2, Radio, Eye } from "lucide-react";
import { createPromoBanner, activatePromoBanner, deactivatePromoBanner, deletePromoBanner } from "./actions";
import toast from "react-hot-toast";

interface PromoBanner {
  id: string;
  message: string;
  linkText: string | null;
  linkHref: string | null;
  color: string;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

const COLORS = [
  { value: "teal",  label: "Teal",  preview: "bg-teal-500/15 border-teal-500/30 text-teal-300" },
  { value: "amber", label: "Amber", preview: "bg-amber-500/15 border-amber-500/30 text-amber-300" },
  { value: "rose",  label: "Rose",  preview: "bg-rose-500/15 border-rose-500/30 text-rose-300" },
  { value: "sky",   label: "Sky",   preview: "bg-sky-500/15 border-sky-500/30 text-sky-300" },
];

function getColorClass(color: string) {
  return COLORS.find(c => c.value === color)?.preview ?? COLORS[0].preview;
}

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/05 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50 transition-colors";

export default function PromoClient({ initialBanners }: { initialBanners: PromoBanner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    message: "", linkText: "", linkHref: "", color: "teal", expiresAt: "",
  });

  const handleCreate = () => {
    if (!form.message.trim()) { toast.error("Message required"); return; }
    startTransition(async () => {
      try {
        await createPromoBanner({
          message: form.message,
          linkText: form.linkText || undefined,
          linkHref: form.linkHref || undefined,
          color: form.color,
          expiresAt: form.expiresAt || undefined,
        });
        const nb: PromoBanner = {
          id: crypto.randomUUID(),
          message: form.message,
          linkText: form.linkText || null,
          linkHref: form.linkHref || null,
          color: form.color,
          isActive: false,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
          createdAt: new Date(),
        };
        setBanners(prev => [nb, ...prev]);
        setForm({ message: "", linkText: "", linkHref: "", color: "teal", expiresAt: "" });
        setShowForm(false);
        toast.success("Banner created!");
      } catch (e: any) { toast.error(e.message ?? "Error"); }
    });
  };

  const handleActivate = (id: string) => {
    startTransition(async () => {
      await activatePromoBanner(id);
      setBanners(prev => prev.map(b => ({ ...b, isActive: b.id === id })));
      toast.success("Banner activated — visible site-wide");
    });
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      await deactivatePromoBanner(id);
      setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: false } : b));
      toast.success("Banner deactivated");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this banner?")) return;
    startTransition(async () => {
      await deletePromoBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    });
  };

  const activeBanner = banners.find(b => b.isActive);

  return (
    <div className="space-y-6">

      {/* Live preview */}
      {activeBanner ? (
        <div className={`flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border text-sm font-semibold ${getColorClass(activeBanner.color)}`}>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>LIVE: {activeBanner.message}</span>
          </div>
          {activeBanner.linkText && activeBanner.linkHref && (
            <a href={activeBanner.linkHref} target="_blank" rel="noopener" className="underline text-xs opacity-80 hover:opacity-100 flex-shrink-0">
              {activeBanner.linkText} →
            </a>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/08 bg-white/02 text-sm text-gray-500">
          <Eye className="w-4 h-4" /> No active promo banner. Activate one below to show it site-wide.
        </div>
      )}

      {/* Create form */}
      <div className="glass border border-white/08 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" /> Create Banner
          </h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-xl text-sm font-bold text-white">
            <Plus className="w-4 h-4" /> New Banner
          </button>
        </div>

        {showForm && (
          <div className="mt-4 space-y-4 border-t border-white/08 pt-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Message *</label>
              <input value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="🔥 50% off PRO this weekend only — use code SAVE50"
                className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Link Text</label>
                <input value={form.linkText} onChange={e => setForm({ ...form, linkText: e.target.value })}
                  placeholder="Upgrade now" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Link URL</label>
                <input value={form.linkHref} onChange={e => setForm({ ...form, linkHref: e.target.value })}
                  placeholder="/pricing" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c.value} onClick={() => setForm({ ...form, color: c.value })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${c.preview} ${form.color === c.value ? "ring-2 ring-white/30" : "opacity-50"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Auto-expire</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className={inputCls} />
              </div>
            </div>
            {/* Live preview */}
            {form.message && (
              <div className={`flex items-center justify-between gap-4 px-5 py-3 rounded-xl border text-sm font-semibold ${getColorClass(form.color)}`}>
                <span>Preview: {form.message}</span>
                {form.linkText && <span className="underline text-xs opacity-80">{form.linkText} →</span>}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={isPending}
                className="btn-gradient px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50">
                Save Banner
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl glass border border-white/10 text-gray-400 text-sm hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Banner list */}
      <div className="glass border border-white/08 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/08">
          <h2 className="font-bold text-white">All Banners</h2>
        </div>
        {banners.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No banners yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/05">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/02 group">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${b.isActive ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" : "bg-gray-700"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{b.message}</p>
                  <p className="text-xs text-gray-500">
                    Color: {b.color}
                    {b.linkText && ` · Link: ${b.linkText}`}
                    {b.expiresAt && ` · Expires: ${new Date(b.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {b.isActive ? (
                    <button onClick={() => handleDeactivate(b.id)} disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(b.id)} disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-all">
                      Activate
                    </button>
                  )}
                  <button onClick={() => handleDelete(b.id)} disabled={isPending}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
