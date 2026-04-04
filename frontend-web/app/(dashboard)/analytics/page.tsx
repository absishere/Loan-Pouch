"use client";

import { mockUser, mockTrustScoreBreakdown, mockTrustScoreHistory } from "@/lib/mock-data";
import { getTrustScoreTier } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, Target } from "lucide-react";

export default function AnalyticsPage() {
  const { tier, baseRate, color } = getTrustScoreTier(mockUser.trustScore);
  const maxScore = 850;
  const scorePercentage = (mockUser.trustScore / maxScore) * 100;

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
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - scorePercentage / 100)}`}
                    className={color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold font-syne">{mockUser.trustScore}</p>
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
                <p className="text-sm text-gray-600 mt-1">Your current lending rate</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold">Rank</h3>
                </div>
                <p className="text-3xl font-bold font-syne">Top 35%</p>
                <p className="text-sm text-gray-600 mt-1">Among all borrowers</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-purple-600" />
                  </div>
                  <h3 className="font-bold">Next Tier</h3>
                </div>
                <p className="text-3xl font-bold font-syne">+16 pts</p>
                <p className="text-sm text-gray-600 mt-1">To reach Reliable tier</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <h3 className="font-bold">Streak</h3>
                </div>
                <p className="text-3xl font-bold font-syne">3</p>
                <p className="text-sm text-gray-600 mt-1">On-time repayments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
          <h2 className="text-lg font-bold font-syne mb-6">Score Breakdown</h2>
          <div className="space-y-4">
            {mockTrustScoreBreakdown.map((item) => {
              const percentage = (item.score / item.weight) * 100;
              return (
                <div key={item.factor}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{item.factor}</span>
                    <span className="text-sm text-gray-600">
                      {item.score} / {item.weight} points ({item.weight}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-black h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score History Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-lg font-bold font-syne mb-6">Trust Score History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTrustScoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[400, 500]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#000000"
                strokeWidth={3}
                dot={{ fill: '#000000', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* What-If Simulator */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mt-8">
          <h2 className="text-lg font-bold font-syne mb-4">💡 What-If Simulator</h2>
          <p className="text-sm text-gray-700 mb-4">
            If you repay your current active loan on time, your score will increase to{" "}
            <strong className="text-black">{mockUser.trustScore + 1}</strong>, reducing your interest rate to{" "}
            <strong className="text-black">{(baseRate - 0.002).toFixed(2)}%</strong>.
          </p>
          <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            View Projections
          </button>
        </div>
      </div>
    </div>
  );
}
