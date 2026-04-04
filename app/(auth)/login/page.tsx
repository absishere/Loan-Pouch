"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [pin, setPin] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-black/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-black/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold font-syne mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-gray-600">Enter your mPIN to continue</p>
        </div>

        <div className="clay-card p-8 clay-glow">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">mPIN</label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="clay-input w-full px-4 py-3 focus:outline-none"
              placeholder="Enter 6-digit mPIN"
            />
          </div>

          <button className="clay-button w-full text-white py-3 mb-4">
            Sign In
          </button>

          <button className="clay-card w-full text-gray-700 py-3 hover:scale-105 transition-transform mb-6">
            Use Biometric
          </button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-black font-medium hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
