"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ethers } from "ethers";

import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { calculateInterestRate, formatCurrency } from "@/lib/utils";

const PURPOSES = ["Education", "Medical", "Emergency", "Personal"];
const DEMO_GUARANTERS = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
];

export default function BorrowPage() {
  const [amount, setAmount] = useState(10000);
  const [duration, setDuration] = useState(30);
  const [purpose, setPurpose] = useState("Personal");
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [guaranters, setGuaranters] = useState(DEMO_GUARANTERS);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskInfo, setRiskInfo] = useState<{ risk_label: string; risk_probability: number } | null>(null);
  const [helper, setHelper] = useState<string | null>(null);

  const trustScore = 450;
  const interestRate = calculateInterestRate(trustScore);
  const interestAmount = amount * (interestRate / 100) * (duration / 365);
  const totalRepayment = amount + interestAmount;
  const isMilestone = amount >= 1000000;

  useEffect(() => {
    const current = getCurrentUser();
    if (current?.walletAddress) {
      setBorrowerAddress(current.walletAddress);
    }
  }, []);

  const updateGuaranter = (i: number, v: string) => {
    const next = [...guaranters];
    next[i] = v;
    setGuaranters(next);
  };

  const isValidAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());

  const checkRisk = async () => {
    try {
      const res = await api.getRiskScore(trustScore, amount, duration, borrowerAddress || undefined);
      setRiskInfo(res);
    } catch {
      setError("Could not fetch AI risk score. Is the backend running?");
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setHelper(null);
    setTxHash(null);

    if (!borrowerAddress || guaranters.some((g) => !g)) {
      setError("Please fill your wallet and all 3 guaranter wallet addresses.");
      return;
    }
    if (!isValidAddress(borrowerAddress) || guaranters.some((g) => !isValidAddress(g))) {
      setError("All wallet addresses must be valid 42-char hex addresses (0x...).");
      return;
    }

    try {
      setLoading(true);
      const amountWei = ethers.parseUnits(amount.toString(), 18).toString();
      const interestWei = ethers.parseUnits(interestAmount.toFixed(18), 18).toString();

      const res = await api.requestLoan({
        borrower_address: borrowerAddress,
        amount: amountWei,
        interest_amount: interestWei,
        guardians: guaranters,
        funding_deadline_days: duration,
      });
      setTxHash(res.tx_hash);
      setHelper("Loan request created. Ask your guaranters to approve in the Guaranter Console.");
    } catch (e: any) {
      setError(e?.message ?? "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (label?: string) => {
    if (label === "Low") return "text-green-700 bg-green-50 border-green-200";
    if (label === "Medium") return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-syne">Request a Loan</h1>
            <p className="text-sm text-gray-600">On-chain via LoanPouchEscrow • Sepolia Testnet</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            {txHash && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 font-medium">Loan request submitted!</p>
                <p className="text-xs text-green-600 font-mono mt-1 break-all">TX: {txHash}</p>
              </div>
            )}
            {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            {helper && <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm">{helper}</div>}

            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-lg font-bold font-syne mb-6">Loan Details</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Your Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={borrowerAddress}
                  onChange={(e) => setBorrowerAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Loan Amount (?)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amount}
                    min={100}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {isMilestone && <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">Milestone Mode</span>}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Repayment Period</label>
                <div className="grid grid-cols-3 gap-3">
                  {[7, 15, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setDuration(days)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        duration === days ? "border-black bg-black text-white" : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {PURPOSES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Guaranter Wallet Addresses</label>
                <p className="text-xs text-gray-500 mb-3">Guaranters with Trust Score {">="} 50 carry 2x voting weight</p>
                {guaranters.map((g, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Guaranter ${i + 1} (0x...)`}
                    value={g}
                    onChange={(e) => updateGuaranter(i, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm mb-2"
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={checkRisk}
                  className="px-6 py-3 border-2 border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium"
                >
                  Check AI Risk
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit Loan Request"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold font-syne mb-4">Loan Summary</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
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
                  <span className="font-bold font-syne text-red-600">{formatCurrency(interestAmount)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-medium">Total Repayment</span>
                  <span className="font-bold font-syne text-lg">{formatCurrency(totalRepayment)}</span>
                </div>
              </div>

              {riskInfo && (
                <div className={`p-3 rounded-lg border text-sm font-medium text-center ${riskColor(riskInfo.risk_label)}`}>
                  AI Risk: {riskInfo.risk_label} ({(riskInfo.risk_probability * 100).toFixed(0)}%)
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h4 className="font-bold text-sm mb-3">What happens next?</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>Request posted to community pool</li>
                <li>Guaranters approve the loan</li>
                <li>Lenders fund your request</li>
                <li>{isMilestone ? "Funds released in 25% tranches" : "Full funds released on approval"}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

