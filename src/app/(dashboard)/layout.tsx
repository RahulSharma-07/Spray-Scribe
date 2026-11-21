"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Menu, X, Bell, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { NotificationCenter } from "@/components/layout/NotificationCenter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const credits = (session?.user as any)?.credits ?? 0;

  return (
    <div className="fixed inset-0 flex bg-background overflow-hidden">
      {/* Desktop Sidebar — full height, internal scroll */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex-shrink-0">
            <DashboardSidebar />
          </div>
        </div>
      )}

      {/* Main Content — header fixed, page area scrolls */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <header className="relative z-10 h-16 border-b border-white/08 bg-black/10 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl glass border border-white/10 hover:border-white/20 transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>

          <div className="flex items-center gap-1 lg:hidden">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base gradient-text-brand">Spray Scribe</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Credits Mobile */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 text-sm lg:hidden">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-semibold text-yellow-400">{credits}</span>
            </div>

            {/* Notification bell */}
            <NotificationCenter credits={credits} />

            {/* Upgrade CTA if low credits */}
            {credits < 3 && (
              <Link
                href="/upgrade"
                className="hidden sm:flex btn-gradient items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get More Credits
              </Link>
            )}
          </div>
        </header>

        {/* Page Content — the ONLY scrollable area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
