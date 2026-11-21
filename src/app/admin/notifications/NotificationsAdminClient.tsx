"use client";

import { useState, useTransition } from "react";
import {
  Bell, Send, Trash2, Info, CheckCircle2, AlertTriangle, AlertCircle,
  Users, User as UserIcon, Radio, ChevronDown,
} from "lucide-react";
import { sendNotification, deleteNotification } from "./actions";

type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string | null;
  isRead: boolean;
  createdAt: Date;
  recipientLabel: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: any; color: string; bg: string }> = {
  info:    { label: "Info",    icon: Info,         color: "text-blue-400",   bg: "bg-blue-500/10"   },
  success: { label: "Success", icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/10"  },
  warning: { label: "Warning", icon: AlertTriangle,color: "text-orange-400", bg: "bg-orange-500/10" },
  error:   { label: "Error",   icon: AlertCircle,  color: "text-red-400",    bg: "bg-red-500/10"    },
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function NotificationsAdminClient({
  initialNotifications,
  initialTotal,
  users,
}: {
  initialNotifications: NotificationRow[];
  initialTotal: number;
  users: User[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle]       = useState("");
  const [message, setMessage]   = useState("");
  const [type, setType]         = useState<NotificationType>("info");
  const [target, setTarget]     = useState<"all" | "user">("all");
  const [userId, setUserId]     = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function handleSend() {
    setFormError("");
    setFormSuccess("");

    if (!title.trim() || !message.trim()) {
      setFormError("Title and message are required.");
      return;
    }
    if (target === "user" && !userId) {
      setFormError("Please select a user.");
      return;
    }

    startTransition(async () => {
      try {
        await sendNotification({
          title: title.trim(),
          message: message.trim(),
          type,
          userId: target === "user" ? userId : undefined,
        });

        // Optimistically prepend to list
        const user = target === "user" ? users.find(u => u.id === userId) : null;
        const newRow: NotificationRow = {
          id: crypto.randomUUID(),
          title: title.trim(),
          message: message.trim(),
          type,
          userId: target === "user" ? userId : null,
          isRead: false,
          createdAt: new Date(),
          recipientLabel: user ? (user.name ?? user.email) : "All Users",
        };
        setNotifications(prev => [newRow, ...prev]);
        setFormSuccess("Notification sent successfully!");
        setTitle("");
        setMessage("");
        setType("info");
        setTarget("all");
        setUserId("");
      } catch (err: any) {
        setFormError(err.message ?? "Failed to send notification.");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
      } catch {
        // silent
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send messages to specific users or broadcast to everyone</p>
        </div>
      </div>

      {/* Send Notification Card */}
      <div className="glass border border-white/10 rounded-3xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-400" />
          Send Notification
        </h2>

        {/* Target */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTarget("all")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              target === "all"
                ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                : "bg-white/03 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            Broadcast to All Users
          </button>
          <button
            type="button"
            onClick={() => setTarget("user")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              target === "user"
                ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                : "bg-white/03 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Send to Specific User
          </button>
        </div>

        {/* User selector */}
        {target === "user" && (
          <div className="relative">
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full appearance-none bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 pr-10"
            >
              <option value="" className="bg-[#0c1019]">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-[#0c1019]">
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Scheduled Maintenance"
            className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Enter the notification message…"
            className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.entries(TYPE_CONFIG) as [NotificationType, typeof TYPE_CONFIG[NotificationType]][]).map(([t, cfg]) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === t
                    ? `${cfg.bg} border-current ${cfg.color}`
                    : "bg-white/03 border-white/10 text-gray-500 hover:border-white/20 hover:text-white"
                }`}
              >
                <cfg.icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Errors / Success */}
        {formError && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{formError}</p>
        )}
        {formSuccess && (
          <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">{formSuccess}</p>
        )}

        <button
          onClick={handleSend}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
          {isPending ? "Sending…" : "Send Notification"}
        </button>
      </div>

      {/* Sent Notifications History */}
      <div className="glass border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-white/08 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Sent Notifications
          </h2>
          <span className="text-xs font-semibold text-gray-500 bg-white/05 px-3 py-1 rounded-full">
            {notifications.length} total
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/05">
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type as NotificationType] ?? TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div key={n.id} className="flex items-start gap-4 p-5 hover:bg-white/02 transition-colors group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-white">{n.title}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-600">
                      <span className="flex items-center gap-1">
                        {n.userId ? <UserIcon className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                        {n.recipientLabel}
                      </span>
                      <span>·</span>
                      <span>{formatDate(n.createdAt)}</span>
                      {n.isRead && <span className="text-green-500/70">· Read</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all disabled:opacity-30"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
