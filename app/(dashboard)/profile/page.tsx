"use client";

import { mockUser } from "@/lib/mock-data";
import { formatDate, getTrustScoreTier } from "@/lib/utils";
import { User, Shield, Users, Download, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  const { tier, color } = getTrustScoreTier(mockUser.trustScore);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockUser.walletAddress);
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
              {mockUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-syne mb-1">{mockUser.name}</h2>
              <p className="text-gray-600 mb-2">{mockUser.email}</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                <span className="text-sm font-medium">Trust Score: {mockUser.trustScore}</span>
                <span className="text-xs opacity-75">({tier})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="font-medium">{mockUser.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-medium">{formatDate(mockUser.joined)}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200">
                {mockUser.walletAddress}
              </code>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} />
            <h3 className="text-lg font-bold font-syne">KYC Verification</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Aadhaar Verified</p>
                  <p className="text-sm text-gray-600">Identity confirmed</p>
                </div>
              </div>
              <span className="text-xs text-green-700 font-medium">Verified</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">PAN Verified</p>
                  <p className="text-sm text-gray-600">Tax information confirmed</p>
                </div>
              </div>
              <span className="text-xs text-green-700 font-medium">Verified</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Biometric Registered</p>
                  <p className="text-sm text-gray-600">Face recognition active</p>
                </div>
              </div>
              <span className="text-xs text-green-700 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Recovery Guardians */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={24} />
              <h3 className="text-lg font-bold font-syne">Recovery Guardians</h3>
            </div>
            <button className="text-sm text-black hover:underline">+ Add Guardian</button>
          </div>
          <div className="space-y-3">
            {mockUser.guardians.map((guardian) => (
              <div key={guardian.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {guardian.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium">{guardian.name}</p>
                    <p className="text-sm text-gray-600">{guardian.phone}</p>
                  </div>
                </div>
                <button className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            💡 Guardians can help you recover your wallet if you lose access. 2 out of 3 guardians must approve recovery.
          </p>
        </div>

        {/* Security Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-bold font-syne mb-6">Security Settings</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-medium">Change mPIN</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-medium">Change tPIN</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-medium">Update Biometric</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-700">
              <span className="font-medium">Lock Wallet (Emergency)</span>
              <span className="text-red-400">→</span>
            </button>
          </div>
        </div>

        {/* Export Trust Score */}
        <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-syne mb-2">Export Trust Score Certificate</h3>
              <p className="text-sm opacity-75">Download a verified PDF of your Trust Score for sharing</p>
            </div>
            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              <Download size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
