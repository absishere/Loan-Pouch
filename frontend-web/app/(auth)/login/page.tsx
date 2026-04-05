"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { auth } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!phone || !pin) {
      setError("Enter phone number and mPIN.");
      return;
    }

    try {
      setLoading(true);
      const res = await auth.loginUser(phone, pin);
      setCurrentUser({
        name: res.user.name,
        phoneLast4: res.user.phoneLast4,
        trustScore: res.user.trustScore,
        walletAddress: res.user.walletAddress,
        joined: new Date().toISOString(),
      });
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Invalid phone or mPIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black font-syne mb-2 bg-black text-transparent bg-clip-text">Login</h1>
          <p className="text-gray-600 font-medium tracking-tight">Use your phone and mPIN</p>
        </div>

        <div className="clay-card p-8 clay-glow">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="clay-input w-full px-4 py-3 focus:outline-none"
              placeholder="+91 9876543210"
            />
          </div>

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

          {error && <div className="mb-4 text-sm text-red-600 font-medium">{error}</div>}

          <button onClick={handleLogin} disabled={loading} className="clay-button w-full text-white py-4 font-black uppercase tracking-widest text-lg disabled:opacity-60">
            {loading ? "Signing In..." : "Unlock Wallet"}
          </button>

          <div className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-black font-medium hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

