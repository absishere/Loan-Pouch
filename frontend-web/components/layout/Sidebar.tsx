"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, TrendingDown, BarChart3, History, User, LogOut, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import { getCurrentUser, logout } from "@/lib/session";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Borrow", href: "/borrow" },
  { icon: TrendingDown, label: "Lend", href: "/lend" },
  { icon: ShieldCheck, label: "Guaranter", href: "/guaranter" },
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
  const router = useRouter();
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) setUser(current);
  }, []);

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
        w-[240px] h-screen clay-sidebar text-white flex flex-col fixed left-0 top-0 z-50 border-r border-white/20
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
        <div className="p-8">
          <h1 className="text-2xl font-black font-syne tracking-tighter text-white">Loan Pouch</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mt-1">Biometric Micro-Loans</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold ${
                  isActive
                    ? "bg-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <Link href="/profile" className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all">
            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center text-sm font-black shadow-lg">
              {user ? getInitials(user.name) : "LP"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate">{user ? user.name : "Loan Member"}</p>
              <p className="text-xs text-gray-400 font-bold">Verified Account</p>
            </div>
          </Link>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="w-full flex items-center gap-3 px-5 py-3 mt-4 text-sm font-bold text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

