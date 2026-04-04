"use client";

import { getTrustScoreTier } from "@/lib/utils";
import { User, Shield, Users, Download, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  
  // Empty default state to prevent compilation error since mock-data was deleted
  const userFallback = {
    name: "Web Prototyper",
    trustScore: 450,
    walletAddress: "0x123...abc",
    phone: "+91 xxxxxxxxxx",
    joined: new Date().toISOString(),
    email: "demo@loanpouch.com",
    guardians: []
  };

  const { tier, color } = getTrustScoreTier(userFallback.trustScore);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userFallback.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-2xl font-bold font-syne">Profile</h1>
        <p className="text-sm text-gray-600">Manage your account settings and security</p>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Profile Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold">
              {userFallback.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-syne mb-1">{userFallback.name}</h2>
              <p className="text-gray-600 mb-2">{userFallback.email}</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                <span className="text-sm font-medium">Trust Score: {userFallback.trustScore}</span>
                <span className="text-xs opacity-75">({tier})</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} />
            <h3 className="text-lg font-bold font-syne">KYC Verification</h3>
          </div>
          <p className="text-sm text-gray-600">Please use the mobile app to verify your biometrics securely.</p>
        </div>
      </div>
    </div>
  );
}
