"use client";

import { useState } from "react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Filter, Download, ExternalLink } from "lucide-react";

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");

  const transactions: any[] = []; // Removed mock data hookup

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-syne">Transaction History</h1>
            <p className="text-sm text-gray-600">View all your lending and borrowing activity</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "All Transactions" },
            { value: "borrowed", label: "Borrowed" },
            { value: "lent", label: "Lent" },
            { value: "repayment", label: "Repayments" },
            { value: "received", label: "Received" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                filter === item.value
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-600">No transactions found on the blockchain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
