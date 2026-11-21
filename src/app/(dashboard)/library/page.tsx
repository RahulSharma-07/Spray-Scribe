"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Trash2, Eye, Copy, RefreshCw,
  BookOpen, Loader2, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { TOOL_LABELS, formatDate, copyToClipboard, truncate } from "@/lib/utils";
import toast from "react-hot-toast";

const ALL_TOOLS = [
  { value: "ALL", label: "All Tools" },
  { value: "BLOG_GENERATOR", label: "Blog Generator" },
  { value: "INSTAGRAM_CAPTION", label: "Instagram Caption" },
  { value: "PRODUCT_DESCRIPTION", label: "Product Description" },
  { value: "YOUTUBE_DESCRIPTION", label: "YouTube Description" },
  { value: "YOUTUBE_SCRIPT", label: "YouTube Script" },
  { value: "CODE_ASSISTANT", label: "Code Assistant" },
];

interface ContentItem {
  id: string;
  toolType: string;
  title: string;
  output: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toolFilter, setToolFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewItem, setViewItem] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Debounce search input — wait 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when search/filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, toolFilter]);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        ...(toolFilter !== "ALL" && { toolType: toolFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setTotalPages(data.pages);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load content library");
    } finally {
      setLoading(false);
    }
  }, [page, toolFilter, debouncedSearch]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (viewItem?.id === id) setViewItem(null);
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (content: string) => {
    await copyToClipboard(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white mb-1">Content Library</h1>
          <p className="text-gray-400 text-sm">{total} saved items</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/05 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={toolFilter}
            onChange={(e) => setToolFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/05 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer pr-8"
          >
            {ALL_TOOLS.map((t) => (
              <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl shimmer border border-white/05" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center">
          <BookOpen className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">No content found</h3>
          <p className="text-gray-500 text-sm">
            {search || toolFilter !== "ALL" ? "Try adjusting your filters" : "Start generating content to build your library"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="group p-5 rounded-2xl glass border border-white/08 hover:border-white/15 transition-all duration-200 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 mb-2">
                      {TOOL_LABELS[item.toolType] ?? item.toolType}
                    </span>
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{item.title}</h3>
                  </div>
                </div>

                <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-1">
                  {truncate(item.output.replace(/[#*`]/g, ""), 120)}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/08">
                  <span className="text-xs text-gray-600">{formatDate(item.createdAt)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewItem(item)}
                      title="View"
                      className="p-1.5 rounded-lg hover:bg-white/08 text-gray-400 hover:text-white transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.output)}
                      title="Copy"
                      className="p-1.5 rounded-lg hover:bg-white/08 text-gray-400 hover:text-white transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all disabled:opacity-40"
                    >
                      {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 disabled:opacity-40 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] glass-strong rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400">
                    {TOOL_LABELS[viewItem.toolType]}
                  </span>
                  <h3 className="font-display font-bold text-white text-lg mt-2">{viewItem.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopy(viewItem.output)}
                    className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewItem(null)}
                    className="p-2 rounded-xl glass border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="prose-dark whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                  {viewItem.output}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
