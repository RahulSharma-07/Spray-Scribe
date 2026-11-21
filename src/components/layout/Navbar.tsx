"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Menu, X, ChevronDown, User, Settings,
  LayoutDashboard, BookOpen, LogOut, Sparkles, CreditCard
} from "lucide-react";
import { Magnetic } from "@/components/ui/magnetic";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const credits = (session?.user as any)?.credits ?? 0;
  const role = (session?.user as any)?.role;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#060811]/90 border-b border-white/07 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text-brand">
              Spray Scribe
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-amber-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <>
                {/* Credits Badge - HIDE FOR ADMIN */}
                {role !== "ADMIN" && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 text-sm">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="font-semibold text-yellow-400">{credits}</span>
                    <span className="text-gray-400">credits</span>
                  </div>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full btn-gradient flex items-center justify-center text-xs font-bold">
                        {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-200 max-w-24 truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {[
                            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                            { href: "/library", icon: BookOpen, label: "Content Library" },
                            { href: "/settings", icon: Settings, label: "Settings" },
                            { href: "/pricing", icon: CreditCard, label: "Upgrade Plan" },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/08 transition-all duration-150"
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                  <Magnetic>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/05 duration-200"
                    >
                      Sign in
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link
                      href="/signup"
                      className="btn-gradient text-sm font-semibold text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
                    >
                      Get started free
                    </Link>
                  </Magnetic>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-xl glass border border-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 glass-strong"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/08 transition-all duration-150 font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-gradient text-center text-sm font-semibold text-white px-5 py-3 rounded-xl">
                      Dashboard
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-red-400 hover:text-red-300 py-2 transition-colors">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center text-sm font-medium text-gray-300 py-3 hover:text-white">
                      Sign In
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-gradient text-center text-sm font-semibold text-white px-5 py-3 rounded-xl">
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
