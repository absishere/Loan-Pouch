"use client";

import { useEffect, useState } from "react";
import { formatCurrency, getTrustScoreTier, calculateInterestRate, formatDate } from "@/lib/utils";
import { Bell, Wallet, TrendingUp, TrendingDown, Users, ArrowUpRight } from "lucide-react";
import { api, LoanData } from "@/lib/api";

export default function DashboardPage() {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo user since auth is handled by mobile TEE
  const user = {
    name: "Web Prototyper",
    trustScore: 450,
    balance: 50000,
    walletAddress: "0x123...abc",
  };

  const { tier, color } = getTrustScoreTier(user.trustScore);
  const interestRate = calculateInterestRate(user.trustScore);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.listLoans();
        setLoans(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-syne">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 lg:px-4 py-2 rounded-lg border text-xs lg:text-sm ${color.replace('text-', 'bg-').replace('600', '50')} ${color} border-current/20`}>
              <span className="font-medium">Trust Score: {user.trustScore}</span>
              <span className="ml-2 opacity-75 hidden sm:inline">({tier})</span>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">B-INR Balance</span>
              <Wallet size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{formatCurrency(user.balance)}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Live Global Loans</span>
              <Users size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{loans.length}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Interest Rate</span>
              <TrendingDown size={16} className="text-green-500" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{interestRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Transactions</span>
              <ArrowUpRight size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">0</p>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
              <h2 className="text-lg font-bold font-syne mb-4">Recent Global Actions</h2>
              <div className="space-y-3">
                {loans.slice(0, 5).map((loan, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Borrower: {loan.borrower_address.substring(0,6)}...</p>
                      <p className="text-xs text-gray-600">Deadline: {loan.funding_deadline_days} days</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-syne">{formatCurrency(loan.amount / 1e18)}</p>
                      <p className="text-xs text-blue-600">State: {loan.state}</p>
                    </div>
                  </div>
                ))}
                {loans.length === 0 && !loading && (
                   <p className="text-gray-500 text-sm">No live loans yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-xl p-4 lg:p-6">
              <p className="text-sm opacity-75 mb-2">Your Test Wallet</p>
              <p className="text-2xl lg:text-3xl font-bold font-syne mb-4">{formatCurrency(user.balance)}</p>
              <div className="text-xs opacity-75 mb-4 font-mono truncate">{user.walletAddress}</div>
              <button className="w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Mock Add Funds (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
