"use client";

import { useState } from "react";
import { mockLoanRequests, categoryColors } from "@/lib/mock-data";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Filter, Search } from "lucide-react";

export default function LendPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = mockLoanRequests.filter((loan) => {
    if (filter !== "all" && loan.status !== filter) return false;
    if (searchTerm && !loan.borrower.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-2xl font-bold font-syne">Browse Loan Requests</h1>
        <p className="text-sm text-gray-600">Find borrowers and fund their loans</p>
      </div>

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by borrower name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex gap-2">
            {["all", "open", "funded"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors capitalize ${
                  filter === status
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loan Requests Grid */}
        <div className="grid grid-cols-2 gap-6">
          {filteredRequests.map((loan) => {
            const fundingPercentage = (loan.fundedAmount / loan.totalFunded) * 100;
            
            return (
              <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                {/* Borrower Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                      {loan.borrower.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold">{loan.borrower.name}</h3>
                      <p className="text-sm text-gray-600">
                        Trust Score: <span className="font-medium">{loan.borrower.trustScore}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                    loan.status === 'funded' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {loan.status}
                  </span>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold font-syne">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                    <p className="text-2xl font-bold font-syne">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-medium">{loan.duration} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Purpose</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${categoryColors[loan.purpose]}`}>
                      {loan.purpose}
                    </span>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="font-medium">{formatCurrency(loan.fundedAmount)} / {formatCurrency(loan.totalFunded)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all"
                      style={{ width: `${fundingPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  disabled={loan.status === 'funded'}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    loan.status === 'funded'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {loan.status === 'funded' ? 'Fully Funded' : 'Fund This Loan'}
                </button>

                {/* Footer */}
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Posted {formatDate(loan.createdAt)} • Expires {formatDate(loan.expiresAt)}
                </p>
              </div>
            );
          })}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No loan requests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
