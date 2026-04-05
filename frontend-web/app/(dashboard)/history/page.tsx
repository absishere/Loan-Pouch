"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserWallet = getCurrentUser()?.walletAddress?.toLowerCase();

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const snap = await api.getLoanSnapshot();
        const txs: any[] = [];

        for (const loan of [...snap.current_requests, ...snap.past_requests]) {
          const borrower = loan.borrower?.toLowerCase();
          const isBorrower = borrower && currentUserWallet && borrower === currentUserWallet;
          const isGuaranter = (loan.guardians || []).map((g) => g.toLowerCase()).includes(currentUserWallet || "");

          if (isBorrower) {
            txs.push({
              id: `borrow-${loan.id}`,
              type: "borrowed",
              amount: loan.target_amount / 1e18,
              status: loan.state,
              party: "Marketplace Lenders",
            });
          }

          if (isGuaranter) {
            txs.push({
              id: `guaranter-${loan.id}`,
              type: "guaranter",
              amount: loan.target_amount / 1e18,
              status: loan.state,
              party: `Borrower ${loan.borrower.slice(0, 10)}...`,
            });
          }
        }

        setTransactions(txs);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [currentUserWallet]);

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [filter, transactions]);

  const stateLabel = (s: number) => {
    if (s === 0) return "Gathering";
    if (s === 1) return "Pending Guaranters";
    if (s === 2) return "Disbursed";
    if (s === 3) return "Repaid";
    if (s === 4) return "Cancelled";
    return "Defaulted";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-2xl font-bold font-syne">Transaction History</h1>
        <p className="text-sm text-gray-600">Current and past request status from shared backend storage</p>
      </div>

      <div className="p-8">
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "All" },
            { value: "borrowed", label: "Borrowed" },
            { value: "guaranter", label: "Guaranter" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                filter === item.value ? "border-black bg-black text-white" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-600">No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium">{tx.type === "borrowed" ? "Borrowed" : "Guaranter Vote"}</p>
                  <p className="text-sm text-gray-600">{tx.party}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">INR {tx.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{stateLabel(tx.status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

