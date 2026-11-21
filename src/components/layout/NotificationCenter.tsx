"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell, Sparkles, AlertCircle, CheckCircle2, MessageSquare,
  Info, X, AlertTriangle, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type IconMap = Record<string, any>;

const TYPE_ICONS: IconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
  info:    Info,
};

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationCenter({ credits }: { credits: number }) {
  const [isOpen, setIsOpen]             = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]           = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silent — keep existing state
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 60 seconds while page is open
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Add a "low credits" synthetic notification in memory when credits are low
  const allNotifications: Notification[] = (() => {
    const base = [...notifications];
    if (credits < 3) {
      base.unshift({
        id: "__low_credits__",
        type: "warning",
        title: "Low Credits",
        message: `You have only ${credits} credit${credits !== 1 ? "s" : ""} left. Upgrade to continue generating.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
    return base;
  })();

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // silent
    }
  };

  const removeNotification = async (id: string) => {
    // Synthetic low-credits notification lives only in memory
    if (id === "__low_credits__") return;

    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    } catch {
      // silent
    }
  };

  const markOneRead = async (id: string) => {
    if (id === "__low_credits__") return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      // silent
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/05"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0c1019] rounded-3xl border border-white/10 shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/08 flex items-center justify-between bg-white/02">
              <h3 className="font-display font-bold text-white text-base">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/05 transition-all disabled:opacity-40"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading && allNotifications.length === 0 ? (
                <div className="p-10 text-center">
                  <RefreshCw className="w-6 h-6 text-gray-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading…</p>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/05 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/05">
                  {allNotifications.map((n) => {
                    const Icon = TYPE_ICONS[n.type] ?? Info;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markOneRead(n.id)}
                        className={`p-4 transition-all hover:bg-white/04 group relative cursor-pointer ${
                          !n.isRead ? "bg-blue-500/02" : ""
                        }`}
                      >
                        {!n.isRead && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-blue-500" />
                        )}
                        <div className="flex gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              n.type === "warning" ? "bg-orange-500/10 text-orange-400"
                              : n.type === "success" ? "bg-green-500/10 text-green-400"
                              : n.type === "error"   ? "bg-red-500/10 text-red-400"
                              : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className={`text-sm font-bold leading-none mb-1 ${n.isRead ? "text-gray-400" : "text-white"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 leading-relaxed mb-1.5 break-words">
                              {n.message}
                            </p>
                            <span className="text-[10px] font-medium text-gray-600">
                              {relativeTime(n.createdAt)}
                            </span>
                          </div>
                          {n.id !== "__low_credits__" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                              className="absolute top-4 right-4 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/08 bg-white/01">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="block w-full py-2.5 text-center text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                Notification Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
