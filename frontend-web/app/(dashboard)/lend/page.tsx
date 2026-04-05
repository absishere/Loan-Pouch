"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { RefreshCw, Search } from "lucide-react";

import { api, LoanResponse } from "@/lib/api";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

const LOAN_STATE_LABELS: Record<number, string> = {
  0: "Gathering",
  1: "Pending Guaranters",
  2: "Disbursed",
  3: "Repaid",
  4: "Cancelled",
  5: "Defaulted",
};

export default function LendPage() {
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [fundingId, setFundingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listLoans(0, 50);
      setLoans(data);
    } catch {
      setError("Could not reach backend. Is FastAPI running on :8000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const handleFund = async (loan: LoanResponse) => {
    const current = getCurrentUser();
    const lender = current?.walletAddress || prompt("Enter your wallet address:");
    if (!lender) return;

    const remaining = Math.max(0, loan.target_amount - loan.gathered_amount);
    const maxAmount = Number(ethers.formatUnits(BigInt(remaining), 18));
    const amount = prompt(`Enter B-INR amount to lend (max ${maxAmount.toFixed(2)}):`);
    if (!amount) return;

    try {
      setFundingId(loan.id);
      const amountWei = ethers.parseUnits(amount, 18).toString();
      const res = await api.fundLoan(loan.id, amountWei, lender);
      alert(`Funded successfully. TX: ${res.tx_hash}`);
      await loadLoans();
    } catch (e: any) {
      alert(e?.message || "Funding failed.");
    } finally {
      setFundingId(null);
    }
  };

  const riskColor = (label?: string) => {
    if (label === "Low") return "text-green-700 bg-green-50 border-green-200";
    if (label === "Medium") return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const filteredLoans = loans.filter((loan) => {
    if (filter === "gathering" && loan.state !== 0) return false;
    if (filter === "disbursed" && loan.state !== 2) return false;
    if (filter === "repaid" && loan.state !== 3) return false;
    if (searchTerm && !loan.borrower.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-syne">Browse Loan Requests</h1>
            <p className="text-sm text-gray-600">Live on-chain • LoanPouchEscrow • Sepolia</p>
          </div>
          <button onClick={loadLoans} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by borrower address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex gap-2">
            {["all", "gathering", "disbursed", "repaid"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors capitalize ${
                  filter === s ? "border-black bg-black text-white" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredLoans.map((loan) => {
              const fundingPct = loan.target_amount > 0 ? Math.min(100, (loan.gathered_amount / loan.target_amount) * 100) : 0;
              const stateLabel = LOAN_STATE_LABELS[loan.state] ?? "Unknown";
              return (
                <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {loan.borrower.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold font-mono text-sm">{loan.borrower.slice(0, 14)}...</h3>
                        <p className="text-xs text-gray-500">Tranche {loan.claimed_tranches}/4</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(stateLabel)}`}>{stateLabel}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Target</p>
                      <p className="text-xl font-bold font-syne">{formatCurrency(Number(ethers.formatUnits(BigInt(loan.target_amount), 18)))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">AI Risk</p>
                      {loan.risk_label ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${riskColor(loan.risk_label)}`}>
                          {loan.risk_label} ({((loan.risk_probability ?? 0) * 100).toFixed(0)}%)
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Interest</p>
                      <p className="font-medium">{formatCurrency(Number(ethers.formatUnits(BigInt(loan.target_interest), 18)))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Approvals</p>
                      <p className="font-medium">{loan.approvals} / 3</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Funding Progress</span>
                      <span className="font-medium">{fundingPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${fundingPct}%` }} />
                    </div>
                  </div>

                  <button
                    disabled={loan.state !== 0 || fundingId === loan.id}
                    onClick={() => handleFund(loan)}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      loan.state !== 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : fundingId === loan.id
                        ? "bg-gray-400 text-white"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {fundingId === loan.id ? "Processing..." : loan.state === 0 ? "Fund This Loan" : stateLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredLoans.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No on-chain loans found.</p>
            <p className="text-gray-400 text-sm mt-1">Create a loan from the Borrow tab to see it appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

