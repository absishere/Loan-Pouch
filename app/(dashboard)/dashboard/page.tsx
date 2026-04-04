"use client";

import { mockUser, mockActiveLoans, mockLoanRequests, mockTransactions } from "@/lib/mock-data";
import { formatCurrency, getTrustScoreTier, calculateInterestRate, formatDate, getInitials } from "@/lib/utils";
import { Bell, Wallet, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function DashboardPage() {
  const { tier, color } = getTrustScoreTier(mockUser.trustScore);
  const interestRate = calculateInterestRate(mockUser.trustScore);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-syne">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {mockUser.name.split(' ')[0]}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg border ${color.replace('text-', 'bg-').replace('600', '50')} ${color} border-current/20`}>
              <span className="text-xs font-medium">Trust Score: {mockUser.trustScore}</span>
              <span className="ml-2 text-xs opacity-75">({tier})</span>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">B-INR Balance</span>
              <Wallet size={20} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold font-syne">{formatCurrency(mockUser.balance)}</p>
            <p className="text-xs text-gray-500 mt-1">≈ ${(mockUser.balance / 83).toFixed(2)} USD</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Active Loans</span>
              <Users size={20} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold font-syne">{mockActiveLoans.length}</p>
            <p className="text-xs text-gray-500 mt-1">1 borrowed, 1 lent</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Interest Rate</span>
              <TrendingDown size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold font-syne">{interestRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Based on Trust Score</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <ArrowUpRight size={20} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold font-syne">{mockTransactions.length}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Active Loans */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold font-syne mb-4">Active Loans</h2>
              <div className="space-y-3">
                {mockActiveLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        loan.type === 'borrowed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {loan.type === 'borrowed' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-medium">{loan.type === 'borrowed' ? loan.lender : loan.borrower}</p>
                        <p className="text-sm text-gray-600">Due: {formatDate(loan.dueDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-syne">{formatCurrency(loan.amount)}</p>
                      <p className="text-sm text-gray-600">{loan.interestRate}% • {loan.duration}d</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Loan Requests */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-syne">Recent Loan Requests</h2>
                <a href="/lend" className="text-sm text-black hover:underline">View All →</a>
              </div>
              <div className="space-y-3">
                {mockLoanRequests.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {loan.borrower.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{loan.borrower.name}</p>
                        <p className="text-sm text-gray-600">Trust Score: {loan.borrower.trustScore}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-syne">{formatCurrency(loan.amount)}</p>
                      <p className="text-sm text-gray-600">{loan.duration} days • {loan.interestRate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Wallet */}
            <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-xl p-6">
              <p className="text-sm opacity-75 mb-2">Your Wallet</p>
              <p className="text-3xl font-bold font-syne mb-6">{formatCurrency(mockUser.balance)}</p>
              <div className="text-xs opacity-75 mb-4 font-mono truncate">
                {mockUser.walletAddress}
              </div>
              <button className="w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Add Funds
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold font-syne mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {mockTransactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      tx.type === 'lent' || tx.type === 'repayment' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tx.type === 'lent' || tx.type === 'repayment' ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.counterparty}</p>
                      <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                    </div>
                    <p className={`text-sm font-bold font-syne ${
                      tx.type === 'lent' || tx.type === 'repayment' 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {tx.type === 'lent' || tx.type === 'repayment' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
