"use client";

import { getTrustScoreTier } from "@/lib/utils";
import { TrendingUp, Award, Target } from "lucide-react";

export default function AnalyticsPage() {
  const trustScore = 450;
  const { tier, baseRate, color } = getTrustScoreTier(trustScore);
  const maxScore = 850;
  const scorePercentage = (trustScore / maxScore) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-2xl font-bold font-syne">Trust Score Analytics</h1>
        <p className="text-sm text-gray-600">Track your creditworthiness and performance</p>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Score Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Score Circle */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-4">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`} strokeDashoffset={`${2 * Math.PI * 88 * (1 - scorePercentage / 100)}`}
                    className={color} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold font-syne">{trustScore}</p>
                  <p className="text-sm text-gray-600">out of {maxScore}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                <span className="font-bold">{tier}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-600" />
                  </div>
                  <h3 className="font-bold">Interest Rate</h3>
                </div>
                <p className="text-3xl font-bold font-syne">{baseRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
