"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Filter, Download, ExternalLink, Loader2 } from "lucide-react";

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo wallet
  const currentUserWallet = process.env.NEXT_PUBLIC_WALLET_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  useEffect(() => {
    async function loadRealLoans() {
      try {
        setLoading(true);
        // Explicitly routing to the configured FastAPI port we spun up in Terminal 1
        const res = await fetch("http://127.0.0.1:8000/loans/");
        if (!res.ok) throw new Error("API Offline");
        const data = await res.json();
        
        const myTransactions: any[] = [];
        data.forEach((loan: any) => {
           // Mapping raw Sepolia Blockchain Loan Pydantic JSON to UI elements
           if (loan.borrower.toLowerCase() === currentUserWallet.toLowerCase()) {
              myTransactions.push({
                 id: loan.id,
                 type: "borrowed",
                 amount: loan.target_amount / 1e18,
                 status: loan.state === 3 ? "Completed" : loan.state === 5 ? "Overdue" : "Active",
                 party: "Marketplace Lenders",
                 date: new Date(loan.funding_deadline * 1000).toISOString()
              });
           } else if (loan.guardians && loan.guardians.map((g: string) => g.toLowerCase()).includes(currentUserWallet.toLowerCase())) {
              myTransactions.push({
                 id: loan.id,
                 type: "lent",
                 amount: loan.gathered_amount / 1e18,
                 status: "Active",
                 party: `Borrower: ${loan.borrower.substring(0,8)}...`,
                 date: new Date(loan.funding_deadline * 1000).toISOString()
              });
           }
        });
        
        setTransactions(myTransactions);
      } catch (e) {
        console.error("Fetch failed:", e);
      } finally {
        setLoading(false);
      }
    }
    loadRealLoans();
  }, []);

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
