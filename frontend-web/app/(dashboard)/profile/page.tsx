"use client";

import { getTrustScoreTier, getInitials } from "@/lib/utils";
import { Shield, Copy, Check, Smartphone, Calendar, User, Wallet } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lp_user_profile");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      // Fallback
      setUser({
        name: "Member",
        trustScore: 400,
        walletAddress: "Connect Wallet",
        phone: "Not Verified",
        joined: new Date().toISOString(),
        aadhaar: "XXXX-XXXX-XXXX",
      });
    }
  }, []);

  if (!user) return null;

  const { tier, color } = getTrustScoreTier(user.trustScore);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-3xl font-black font-syne tracking-tight">Your Identity</h1>
        <p className="text-gray-600 font-medium">Verified Biometric Profile on Loan Pouch</p>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center text-5xl font-black shadow-lg">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black font-syne mb-2 tracking-tight">{user.name}</h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-current font-bold ${color}`}>
              <span>Trust Score: {user.trustScore}</span>
              <span className="text-sm opacity-80">({tier})</span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">
                <Wallet size={16} />
                <span className="font-mono">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                <button onClick={copyToClipboard} className="hover:text-black">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">
                <Calendar size={16} />
                <span>Joined {new Date(user.joined).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Details */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Shield size={24} /></div>
              <h3 className="text-xl font-black font-syne">KYC Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="font-bold text-emerald-800">Biometric Profile</span>
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-lg uppercase">Linked</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="font-bold text-emerald-800">Aadhaar (OCR Verified)</span>
                <span className="font-mono text-sm font-bold">{user.aadhaar}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="font-bold text-emerald-800">PAN Card</span>
                <span className="font-mono text-sm font-bold">{user.pan || "XXXXX0000X"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Smartphone size={24} /></div>
              <h3 className="text-xl font-black font-syne">Contact & Security</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Authenticated Phone</p>
                <p className="font-bold">{user.phone}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">mPIN Security</p>
                <p className="font-bold text-emerald-600">Enabled ••••••</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Transaction tPIN</p>
                <p className="font-bold text-emerald-600">Enabled ••••••</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
