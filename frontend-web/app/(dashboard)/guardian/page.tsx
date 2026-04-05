"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

import { api, auth, PendingVoteLoan } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";

const LOAN_STATE_LABELS: Record<number, string> = {
  0: "Gathering Funds",
  1: "Pending Guaranters",
  2: "Disbursed",
  3: "Repaid",
  4: "Cancelled",
  5: "Defaulted",
};

type PendingRecovery = {
  id: number;
  lost_wallet: string;
  new_wallet: string;
  approval_count: number;
  rejection_count: number;
  has_voted: boolean;
};

export default function GuaranterPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [pendingLoans, setPendingLoans] = useState<PendingVoteLoan[]>([]);
  const [pendingRecoveries, setPendingRecoveries] = useState<PendingRecovery[]>([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (current?.walletAddress) setWalletAddress(current.walletAddress);
  }, []);

  const fetchAll = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const [loanData, recoveryData] = await Promise.all([
        api.getPendingGuaranterLoans(addr),
        auth.getPendingRecoveryForGuaranter(addr),
      ]);
      setPendingLoans(Array.isArray(loanData) ? loanData : []);
      setPendingRecoveries(Array.isArray(recoveryData) ? recoveryData : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load guaranter queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) fetchAll(walletAddress);
  }, [walletAddress, fetchAll]);

  const handleLoanVote = async (loanId: number, approve: boolean) => {
    if (!walletAddress) return;
    setVoting(`loan-${loanId}`);
    setError(null);
    setSuccess(null);
    try {
      await api.voteAsGuaranter(loanId, walletAddress, approve);
      setSuccess(approve ? `Approved loan #${loanId}.` : `Rejected loan #${loanId}.`);
      await fetchAll(walletAddress);
    } catch (e: any) {
      setError(e?.message ?? "Loan voting failed.");
    } finally {
      setVoting(null);
    }
  };

  const handleRecoveryVote = async (requestId: number, approve: boolean) => {
    if (!walletAddress) return;
    setVoting(`recovery-${requestId}`);
    setError(null);
    setSuccess(null);
    try {
      await auth.voteRecovery(requestId, walletAddress, approve);
      setSuccess(approve ? `Approved recovery #${requestId}.` : `Rejected recovery #${requestId}.`);
      await fetchAll(walletAddress);
    } catch (e: any) {
      setError(e?.message ?? "Recovery voting failed.");
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-syne flex items-center gap-2">
              <ShieldCheck size={24} /> Guaranter Console
            </h1>
            <p className="text-sm text-gray-600">Approve/reject loan and recovery requests assigned to your wallet.</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 border border-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
              {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "LP"}
            </div>
            <div>
              <p className="text-sm font-medium font-mono">{walletAddress ? `${walletAddress.slice(0, 20)}...` : "No wallet in session"}</p>
              <p className="text-xs text-green-600 font-medium">Connected to backend queue</p>
            </div>
          </div>
          <button onClick={() => walletAddress && fetchAll(walletAddress)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
        {success && <div className="p-4 mb-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">{success}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent" /></div>
        ) : pendingLoans.length === 0 && pendingRecoveries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <ShieldCheck size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No pending approvals for your wallet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingRecoveries.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Wallet Recovery Requests</h2>
                <div className="space-y-4">
                  {pendingRecoveries.map((r) => (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-bold">Recovery #{r.id}</p>
                          <p className="text-xs text-gray-500">2 approvals required</p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium rounded-lg">Pending</span>
                      </div>
                      <p className="text-xs text-gray-500">Lost Wallet</p>
                      <p className="font-mono text-sm mb-2">{r.lost_wallet}</p>
                      <p className="text-xs text-gray-500">New Wallet</p>
                      <p className="font-mono text-sm mb-4">{r.new_wallet}</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm font-medium">Approvals: {r.approval_count} / 2</div>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium">Rejections: {r.rejection_count}</div>
                      </div>
                      {r.has_voted ? (
                        <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-center text-sm font-medium">You already voted on this recovery.</div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRecoveryVote(r.id, false)}
                            disabled={voting === `recovery-${r.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                          >
                            <XCircle size={18} /> {voting === `recovery-${r.id}` ? "Processing..." : "Reject"}
                          </button>
                          <button
                            onClick={() => handleRecoveryVote(r.id, true)}
                            disabled={voting === `recovery-${r.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                          >
                            <CheckCircle size={18} /> {voting === `recovery-${r.id}` ? "Processing..." : "Approve Recovery"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingLoans.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Loan Approval Requests</h2>
                <div className="space-y-4">
                  {pendingLoans.map((loan) => (
                    <div key={loan.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">{loan.borrower.slice(2, 4).toUpperCase()}</div>
                          <div>
                            <p className="font-bold font-mono text-sm">{loan.borrower.slice(0, 16)}...</p>
                            <p className="text-xs text-gray-500">Loan #{loan.id}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium rounded-lg">{LOAN_STATE_LABELS[loan.state]}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                          <p className="font-bold font-syne text-lg">{formatCurrency(loan.target_amount / 1e18)}</p>
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
                        <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-center text-sm font-medium">You already voted on this loan.</div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleLoanVote(loan.id, false)}
                            disabled={voting === `loan-${loan.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                          >
                            <XCircle size={18} /> {voting === `loan-${loan.id}` ? "Processing..." : "Reject"}
                          </button>
                          <button
                            onClick={() => handleLoanVote(loan.id, true)}
                            disabled={voting === `loan-${loan.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                          >
                            <CheckCircle size={18} /> {voting === `loan-${loan.id}` ? "Processing..." : "Approve Loan"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
