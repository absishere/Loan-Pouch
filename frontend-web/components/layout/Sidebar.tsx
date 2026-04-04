"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, TrendingDown, BarChart3, History, User, LogOut, X, ShieldCheck } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Borrow", href: "/borrow" },
  { icon: TrendingDown, label: "Lend", href: "/lend" },
  { icon: ShieldCheck, label: "Guardian", href: "/guardian" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: History, label: "History", href: "/history" },
  { icon: User, label: "Profile", href: "/profile" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-[200px] h-screen clay-sidebar text-white flex flex-col fixed left-0 top-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Logo */}
        <div className="p-6">
          <h1 className="text-xl lg:text-2xl font-bold font-syne">LoanPouch</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose} // Close mobile menu when navigating
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all ${
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center text-xs font-bold backdrop-blur">
              RS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Rahul Sharma</p>
              <p className="text-xs text-gray-400">View Profile</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
