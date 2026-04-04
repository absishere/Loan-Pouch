"use client";

import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Filter, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = mockTransactions.filter((tx) => {
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
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
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

        {/* Transaction Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Counterparty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Transaction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          tx.type === "lent" || tx.type === "repayment"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {tx.type === "lent" || tx.type === "repayment" ? "↑" : "↓"}
                      </div>
                      <span className="font-medium capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{tx.counterparty}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`font-bold font-syne ${
                        tx.type === "lent" || tx.type === "repayment"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {tx.type === "lent" || tx.type === "repayment" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://polygonscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <code className="font-mono">{tx.txHash}</code>
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-600">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
