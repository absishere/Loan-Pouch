"use client";

import { useState } from "react";
import { formatCurrency, calculateInterestRate } from "@/lib/utils";
import { mockUser } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BorrowPage() {
  const [amount, setAmount] = useState(10000);
  const [duration, setDuration] = useState(30);
  const [purpose, setPurpose] = useState("Personal");

  const interestRate = calculateInterestRate(mockUser.trustScore);
  const totalRepayment = amount * (1 + (interestRate / 100) * (duration / 365));
  const interest = totalRepayment - amount;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-syne">Request a Loan</h1>
            <p className="text-sm text-gray-600">Fill in the details to create a loan request</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {/* Form */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-lg font-bold font-syne mb-6">Loan Details</h2>
            
            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Loan Amount (₹)</label>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mb-2"
              />
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <div className="text-sm text-gray-600">
                  <span>₹500 - ₹25,000</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Repayment Period</label>
              <div className="grid grid-cols-3 gap-3">
                {[7, 15, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setDuration(days)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      duration === days
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option>Education</option>
                <option>Medical</option>
                <option>Emergency</option>
                <option>Personal</option>
              </select>
            </div>

            {/* Bank Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Bank Account Number</label>
              <input
                type="text"
                placeholder="Enter account number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">IFSC Code</label>
              <input
                type="text"
                placeholder="Enter IFSC code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium">
              Submit Request
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold font-syne mb-4">Loan Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Loan Amount</span>
                  <span className="font-bold font-syne">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="font-bold font-syne">{interestRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-bold font-syne">{duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interest</span>
                  <span className="font-bold font-syne text-red-600">{formatCurrency(interest)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-medium">Total Repayment</span>
                  <span className="font-bold font-syne text-lg">{formatCurrency(totalRepayment)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Your Trust Score is <strong>{mockUser.trustScore}</strong>. 
                  Improve it to get better rates!
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="font-bold text-sm mb-3">What happens next?</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>✓ Request posted to community</li>
                <li>✓ Lenders review your profile</li>
                <li>✓ Funds released when fully funded</li>
                <li>✓ Repayment auto-collected on due date</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
