"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Wrench, BookOpen, Settings, History,
  LogOut, Zap, Sparkles, ChevronRight, MessageSquare, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tools/all", icon: Wrench, label: "AI Tools" },
  { href: "/library", icon: BookOpen, label: "Content Library" },
  { href: "/history", icon: History, label: "History" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/upgrade", icon: TrendingUp, label: "Upgrade Plan" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [liveCredits, setLiveCredits] = React.useState<number | null>(null);
  const [livePlan, setLivePlan] = React.useState<string | null>(null);
  const [liveName, setLiveName] = React.useState<string | null>(null);

  const credits = liveCredits ?? (session?.user as any)?.credits ?? 0;
  const plan = livePlan ?? (session?.user as any)?.plan ?? "FREE";
  const role = (session?.user as any)?.role;
  const displayName = liveName ?? session?.user?.name ?? "";

  // Fetch live credits/plan from DB — refetch on mount, page change, and every 30s
  useEffect(() => {
    if (!session?.user) return;

    const fetchLive = () => {
      // Fetch credits + plan
      fetch("/api/user/credits")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setLiveCredits(data.credits);
            setLivePlan(data.plan);
          }
        })
        .catch(() => {});

      // Fetch name from profile API
      fetch("/api/user/profile")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.name) setLiveName(data.name);
        })
        .catch(() => {});
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, [session?.user, pathname]);

  // AUTO-REDIRECT ADMINS TO ADMIN PANEL if they land here
  useEffect(() => {
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [role, router]);

  if (role === "ADMIN") return null; // Don't even render for Admin

  return (
    <aside className="flex flex-col w-64 h-full border-r border-white/08 bg-black/20 backdrop-blur-xl overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/08">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text-brand">Spray Scribe</span>
        </Link>
      </div>

      {/* Credits Display */}
      <div className="px-4 py-4 border-b border-white/08">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500/08 to-emerald-500/05 border border-teal-500/15 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Credits Remaining</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">{credits}</div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min((credits / (plan === "FREE" ? 10 : plan === "PRO" ? 100 : 500)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 capitalize">{plan} Plan</span>
            <Link href="/upgrade" className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center gap-0.5">
              Upgrade <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          // "AI Tools" should be active on any /tools/* path
          const isActive =
            item.href === "/tools/all"
              ? pathname.startsWith("/tools")
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          // "Upgrade Plan" gets a special amber accent style
          const isUpgrade = item.href === "/upgrade";

          return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  isUpgrade
                    ? isActive
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
                    : isActive
                      ? "bg-white/10 text-white border border-white/12 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                      : "text-gray-400 hover:text-white hover:bg-white/05"
                )}
              >
                <div className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  isUpgrade
                    ? "text-amber-400"
                    : isActive ? "text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]" : "text-gray-500"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeSide"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                  />
                )}
              </Link>
            );
          })}

        {/* Separator */}
        <div className="pt-2 mt-2 border-t border-white/08" />
      </nav>

      {/* User Profile Bottom */}
      <div className="px-4 py-4 border-t border-white/08">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/05 transition-colors">
          <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-sm font-bold flex-shrink-0">
            {displayName.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{displayName || session?.user?.email}</div>
            <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
