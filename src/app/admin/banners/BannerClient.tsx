"use client";

import { useState } from "react";
import { Banner } from "@prisma/client";
import { createBanner, toggleBannerStatus, deleteBanner } from "./actions";
import { Plus, Trash2, Power, PowerOff, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function BannerClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", subtitle: "", imageUrl: "", ctaText: "", ctaLink: "", order: 0
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, imageUrl: json.url });
        toast.success("Image uploaded!");
      } else {
        toast.error(json.error || "Upload failed");
      }
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBanner(formData);
      toast.success("Banner created! Data will refresh.");
      setShowAdd(false);
      window.location.reload();
    } catch (e) {
      toast.error("Failed to create banner");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white/05 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Title *</label>
              <input required type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Subtitle</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">Upload Image *</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" 
              />
              {formData.imageUrl && <p className="text-xs font-bold text-green-400 mt-2">✓ Image securely attached!</p>}
              {uploading && <p className="text-xs font-bold text-blue-400 mt-2">Uploading to server...</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Order</label>
              <input type="number" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">CTA Text</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">CTA Link</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                value={formData.ctaLink} onChange={e => setFormData({...formData, ctaLink: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Save Banner
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white/05 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-video w-full bg-black/40 flex items-center justify-center relative overflow-hidden">
              {banner.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-500" />
              )}
              <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                Order: {banner.order}
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-white">{banner.title}</h3>
                <p className="text-sm text-gray-400">{banner.subtitle || "No subtitle"}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button 
                  onClick={async () => {
                    await toggleBannerStatus(banner.id, !banner.isActive);
                    setBanners(banners.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
                  }}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    banner.isActive ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
                  }`}
                >
                  {banner.isActive ? <Power size={14}/> : <PowerOff size={14}/>}
                  {banner.isActive ? "Active" : "Disabled"}
                </button>
                <button 
                  onClick={async () => {
                    if(confirm("Delete banner?")) {
                      await deleteBanner(banner.id);
                      setBanners(banners.filter(b => b.id !== banner.id));
                    }
                  }}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
