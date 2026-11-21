"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Image as ImageIcon,
  Settings, Shield, LogOut,
  CreditCard, Sparkles, BarChart3, Database,
  FileText, Bell, Tag, TrendingUp, Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
  { label: "Overview",        href: "/admin/dashboard",     icon: LayoutDashboard },
  { label: "Revenue",         href: "/admin/revenue",       icon: TrendingUp },
  { label: "Users",           href: "/admin/users",         icon: Users },
  { label: "Coupon Codes",    href: "/admin/coupons",       icon: Tag },
  { label: "Promo Banners",   href: "/admin/promo",         icon: Megaphone },
  { label: "Content Hub",     href: "/admin/content",       icon: Database },
  { label: "Transactions",    href: "/admin/transactions",  icon: CreditCard },
  { label: "Banners",         href: "/admin/banners",       icon: ImageIcon },
  { label: "Prompts",         href: "/admin/prompts",       icon: Sparkles },
  { label: "Plans & Pricing", href: "/admin/plans",         icon: CreditCard },
  { label: "Analytics",       href: "/admin/analytics",     icon: BarChart3 },
  { label: "Notifications",   href: "/admin/notifications", icon: Bell },
  { label: "System Logs",     href: "/admin/logs",          icon: FileText },
  { label: "Settings",        href: "/admin/settings",      icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full border-r border-white/05 bg-[#080810] flex flex-col flex-shrink-0 overflow-hidden">
      {/* Brand */}
      <div className="p-5 border-b border-white/05">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-base text-white">Scribe Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {/* Super Admin badge */}
        <div className="px-3 py-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/08 border border-red-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Super Admin Mode</span>
          </div>
        </div>

        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
              pathname === item.href
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "text-gray-500 hover:text-white hover:bg-white/05"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 flex-shrink-0 transition-colors",
              pathname === item.href ? "text-teal-400" : "text-gray-600 group-hover:text-white"
            )} />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/05">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500/60 hover:text-red-400 hover:bg-red-500/05 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
