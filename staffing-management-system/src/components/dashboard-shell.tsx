"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  Menu,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  session: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  title: string;
  hideNotifications?: boolean;
};

export function DashboardShell({ children, navItems, session, title, hideNotifications }: DashboardShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "280px",
          x: isMobileOpen ? 0 : window.innerWidth < 1024 ? "-100%" : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl dark:border-dark-border dark:bg-dark-sidebar/90 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200/60 dark:border-dark-border/60 px-4">
          <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400 whitespace-nowrap overflow-hidden"
              >
                {title}
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-bold">
              {title.charAt(0)}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 scrollbar-hide">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            // @ts-ignore
            const IconComponent = Icons[icon] || Icons.Circle;
            
            return (
              <Link key={href} href={href} className="block">
                <div
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-card dark:hover:text-slate-200"
                  }`}
                >
                  <IconComponent className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  <AnimatePresence mode="popLayout">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 top-1/2 -mt-3 h-6 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-200/60 p-4 dark:border-dark-border/60">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-brand-100 text-brand-700 dark:from-indigo-900/50 dark:to-brand-900/50 dark:text-brand-300 shadow-sm border border-white/50 dark:border-white/5">
              {session?.firstName?.charAt(0) || "U"}
            </div>
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {session?.firstName} {session?.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {session?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-red-600 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border-hover dark:hover:text-red-400">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md hover:text-brand-600 dark:border-dark-border dark:bg-dark-card dark:text-slate-400 dark:hover:text-brand-400 hidden lg:flex transition-transform hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <motion.main
        layout
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-xl dark:border-dark-border/60 dark:bg-dark-bg/70 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-card lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative group">
              <Search className="absolute left-3 h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-dark-border dark:bg-dark-card/50 dark:text-white dark:focus:border-brand-500 dark:focus:bg-dark-card"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            

          </div>
        </header>

        {/* Page Content with AnimatePresence for route changes if we were using it in a custom router, but here just standard render */}
        <div className="flex-1 p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
