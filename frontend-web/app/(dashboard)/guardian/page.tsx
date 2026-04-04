"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { ArrowLeft, ShieldCheck, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const ESCROW_ADDRESS =
  process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x5F20ffB3BC50b37A4c7ed930a7D8e690d9f00a35";

const ESCROW_ABI = [
  "function nextLoanId() view returns (uint256)",
  "function loans(uint256) view returns (uint256 id, uint256 targetAmount, uint256 gatheredAmount, uint256 targetInterest, address borrower, uint8 approvals, uint8 rejections, uint8 state, uint256 fundingDeadline, uint256 guardianDeadline, uint256 repaymentDeadline, uint256 totalRepaidAmount, bool isMilestone, uint8 claimedTranches, uint8 repaidTranches)",
  "function approveByGuardian(uint256 loanId) external",
  "function rejectByGuardian(uint256 loanId) external",
  "function hasGuardianVoted(uint256, address) view returns (bool)",
];

const LOAN_STATE_LABELS: Record<number, string> = {
  0: "Gathering Funds",
  1: "Pending Guardians",
  2: "Disbursed",
  3: "Repaid",
  4: "Cancelled",
  5: "Defaulted",
};

type PendingLoan = {
  id: number;
  borrower: string;
  target_amount: number;
  approvals: number;
  rejections: number;
  state: number;
  has_voted: boolean;
};

export default function GuardianPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      setError("MetaMask is required.");
      return;
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setWalletAddress(addr);
    setConnected(true);
    await fetchPendingLoans(addr, provider);
  };

  const fetchPendingLoans = useCallback(
    async (addr: string, provider?: ethers.BrowserProvider) => {
      setLoading(true);
      setError(null);
      try {
        const p =
          provider ||
          new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, p);

        const nextId: bigint = await contract.nextLoanId();
        const results: PendingLoan[] = [];

        for (let i = 0; i < Number(nextId); i++) {
          try {
            const loan = await contract.loans(i);
            const state = Number(loan.state);

            // Only show loans in Pending_Guardians state (state === 1)
            if (state !== 1) continue;

            // Dynamically check if this wallet is a guardian
            // (We can't query guardians[] position cleanly without a getter—trust the UI)
            const hasVoted: boolean = await contract.hasGuardianVoted(i, addr);

            results.push({
              id: i,
              borrower: loan.borrower,
              target_amount: Number(loan.targetAmount),
              approvals: Number(loan.approvals),
              rejections: Number(loan.rejections),
              state,
              has_voted: hasVoted,
            });
          } catch {
            // Skip loans with bad state
          }
        }
        setPendingLoans(results);
      } catch (e: any) {
        setError("Failed to load guardian queue: " + (e?.message ?? "Unknown error"));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleVote = async (loanId: number, approve: boolean) => {
    if (!(window as any).ethereum) return;
    setVoting(loanId);
    setError(null);
    setSuccess(null);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

      const tx = approve
        ? await contract.approveByGuardian(loanId)
        : await contract.rejectByGuardian(loanId);

      await tx.wait();
      setSuccess(
        approve
          ? `✅ Loan #${loanId} approved! TX: ${tx.hash.slice(0, 18)}…`
          : `🚫 Loan #${loanId} rejected.`
      );
      // Refresh the list
      await fetchPendingLoans(walletAddress);
    } catch (e: any) {
      setError(e?.message ?? "Transaction failed.");
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-syne flex items-center gap-2">
              <ShieldCheck size={24} />
              Guardian Console
            </h1>
            <p className="text-sm text-gray-600">
              Approve or reject loans where you are a designated guardian · Sepolia Testnet
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        {/* Wallet Connect Gate */}
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center">
              <ShieldCheck size={36} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold font-syne mb-2">Connect Your Guardian Wallet</h2>
              <p className="text-gray-500 max-w-sm">
                Connect the same wallet address that was designated as a guardian in a loan request.
              </p>
            </div>
            <button
              onClick={connectWallet}
              className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Connect MetaMask
            </button>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Connected Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 border border-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {walletAddress.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium font-mono">{walletAddress.slice(0, 20)}…</p>
                  <p className="text-xs text-green-600 font-medium">● Connected to Sepolia</p>
                </div>
              </div>
              <button
                onClick={() => fetchPendingLoans(walletAddress)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {/* Status Banners */}
            {error && (
              <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 mb-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent" />
              </div>
            ) : pendingLoans.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                <ShieldCheck size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No pending approvals for your wallet.</p>
                <p className="text-gray-400 text-sm mt-1">
                  You&apos;ll see loans here once a borrower adds your address as a guardian and the loan is fully funded.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {loan.borrower.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold font-mono text-sm">{loan.borrower.slice(0, 16)}…</p>
                          <p className="text-xs text-gray-500">Loan #{loan.id}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium rounded-lg">
                        {LOAN_STATE_LABELS[loan.state]}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                        <p className="font-bold font-syne text-lg">
                          {formatCurrency(loan.target_amount / 1e18)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Approvals</p>
                        <p className="font-bold text-green-600 text-lg">{loan.approvals} / 2 needed</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rejections</p>
                        <p className="font-bold text-red-600 text-lg">{loan.rejections}</p>
                      </div>
                    </div>

                    {loan.has_voted ? (
                      <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-center text-sm font-medium">
                        ✓ You have already voted on this loan
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVote(loan.id, false)}
                          disabled={voting === loan.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          {voting === loan.id ? "Processing…" : "Reject"}
                        </button>
                        <button
                          onClick={() => handleVote(loan.id, true)}
                          disabled={voting === loan.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          {voting === loan.id ? "Signing…" : "Approve Loan"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
