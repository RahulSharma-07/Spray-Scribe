"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Clock, Trash2, RefreshCw, Eye, Loader2, X, Sparkles } from "lucide-react";
import { TOOL_LABELS, formatRelativeDate, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

const TOOL_OPTIONS = [
  { value: "ALL", label: "All Tools" },
  { value: "BLOG_GENERATOR", label: "Blog Generator" },
  { value: "INSTAGRAM_CAPTION", label: "Instagram Caption" },
  { value: "PRODUCT_DESCRIPTION", label: "Product Description" },
  { value: "YOUTUBE_DESCRIPTION", label: "YouTube Description" },
  { value: "YOUTUBE_SCRIPT", label: "YouTube Script" },
  { value: "CODE_ASSISTANT", label: "Code Assistant" },
];

const TOOL_HREFS: Record<string, string> = {
  BLOG_GENERATOR: "/tools/blog-generator",
  INSTAGRAM_CAPTION: "/tools/instagram-caption",
  PRODUCT_DESCRIPTION: "/tools/product-description",
  YOUTUBE_DESCRIPTION: "/tools/youtube-description",
  YOUTUBE_SCRIPT: "/tools/youtube-script",
  CODE_ASSISTANT: "/tools/code-assistant",
};

interface HistoryItem {
  id: string;
  toolType: string;
  title: string;
  output: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toolFilter, setToolFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewItem, setViewItem] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "15",
        ...(toolFilter !== "ALL" && { toolType: toolFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      if (data.success) { setItems(data.items); setTotalPages(data.pages); setTotal(data.total); }
    } catch { toast.error("Failed to load history"); }
    finally { setLoading(false); }
  }, [page, toolFilter, search]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { setPage(1); }, [search, toolFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item from history?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deleted"); setItems((p) => p.filter((i) => i.id !== id)); if (viewItem?.id === id) setViewItem(null); }
      else toast.error("Failed to delete");
    } catch { toast.error("Error"); }
    finally { setDeleting(null); }
  };

  const toolColor: Record<string, string> = {
    BLOG_GENERATOR: "bg-blue-500/15 text-blue-400",
    INSTAGRAM_CAPTION: "bg-pink-500/15 text-pink-400",
    PRODUCT_DESCRIPTION: "bg-green-500/15 text-green-400",
    YOUTUBE_DESCRIPTION: "bg-red-500/15 text-red-400",
    YOUTUBE_SCRIPT: "bg-orange-500/15 text-orange-400",
    CODE_ASSISTANT: "bg-purple-500/15 text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">History</h1>
        <p className="text-gray-400 text-sm">{total} total generations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={toolFilter} onChange={(e) => setToolFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer">
            {TOOL_OPTIONS.map((t) => <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer border border-white/05" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center">
          <Clock className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">No history yet</h3>
          <p className="text-gray-500 text-sm mb-4">Start generating content to see it here</p>
          <Link href="/tools/all" className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> Explore Tools
          </Link>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/08 overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 px-4 py-3 border-b border-white/08 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="col-span-5">Title</span>
            <span className="col-span-3">Tool</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3.5 hover:bg-white/03 transition-colors ${i !== 0 ? "border-t border-white/05" : ""}`}
              >
                <div className="col-span-12 sm:col-span-5">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 sm:hidden mt-0.5">{TOOL_LABELS[item.toolType]} • {formatRelativeDate(item.createdAt)}</p>
                </div>
                <div className="hidden sm:block col-span-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${toolColor[item.toolType] ?? "bg-gray-500/15 text-gray-400"}`}>
                    {TOOL_LABELS[item.toolType]}
                  </span>
                </div>
                <div className="hidden sm:flex col-span-2 items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatRelativeDate(item.createdAt)}
                </div>
                <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button onClick={() => setViewItem(item)} title="View"
                    className="p-1.5 rounded-lg hover:bg-white/08 text-gray-400 hover:text-white transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link href={TOOL_HREFS[item.toolType] ?? "/tools"} title="Reuse tool"
                    className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} title="Delete"
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all disabled:opacity-40">
                    {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-all">
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-all">
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewItem(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[80vh] glass-strong rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${toolColor[viewItem.toolType] ?? "bg-gray-500/15 text-gray-400"}`}>
                    {TOOL_LABELS[viewItem.toolType]}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-2">{viewItem.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(viewItem.createdAt)}</p>
                </div>
                <button onClick={() => setViewItem(null)} className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{viewItem.output}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
