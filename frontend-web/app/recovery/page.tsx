"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";

export default function RecoveryPage() {
  const [lostWallet, setLostWallet] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [guardian1, setGuardian1] = useState("");
  const [guardian2, setGuardian2] = useState("");
  const [guardian3, setGuardian3] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isValid = lostWallet.startsWith("0x") && newWallet.startsWith("0x") && guardian1.startsWith("0x") && guardian2.startsWith("0x");

  const handleSubmit = () => {
    if (!isValid) return;
    // In production: call smart contract initiateRecovery() + approveRecovery()
    // For hackathon: store request in localStorage and simulate guardian approval
    localStorage.setItem("lp_recovery_pending", JSON.stringify({ lostWallet, newWallet, guardians: [guardian1, guardian2, guardian3] }));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-syne flex items-center gap-2"><ShieldCheck size={28} /> Recover Lost Wallet</h1>
            <p className="text-gray-600 text-sm mt-1">2-of-3 Guardian approval needed per the smart contract</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">📨</div>
            <h2 className="text-xl font-bold font-syne mb-2">Recovery Request Submitted!</h2>
            <p className="text-gray-600 text-sm mb-6">Your guardians have been notified. Once 2 of 3 approve on the Guardian Console, your wallet will be migrated to the new address.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-gray-500 mb-1 font-medium">New Wallet</p>
              <p className="font-mono text-sm break-all">{newWallet}</p>
            </div>
            <Link href="/" className="block w-full py-3 bg-black text-white rounded-xl text-center font-medium hover:bg-gray-800">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Lost Wallet Address</label>
              <input type="text" value={lostWallet} onChange={(e) => setLostWallet(e.target.value)} placeholder="0x... (address you lost access to)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Wallet Address</label>
              <input type="text" value={newWallet} onChange={(e) => setNewWallet(e.target.value)} placeholder="0x... (your new wallet)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} />
                <label className="text-sm font-medium">Guardian Addresses (min 2 of 3 must approve)</label>
              </div>
              <div className="space-y-2">
                <input type="text" value={guardian1} onChange={(e) => setGuardian1(e.target.value)} placeholder="Guardian 1 (0x...)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm" />
                <input type="text" value={guardian2} onChange={(e) => setGuardian2(e.target.value)} placeholder="Guardian 2 (0x...)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm" />
                <input type="text" value={guardian3} onChange={(e) => setGuardian3(e.target.value)} placeholder="Guardian 3 optional (0x...)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm" />
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
              ⚠️ Guardians will receive a notification to approve your recovery request via the Guardian Console. This triggers <code>approveRecovery()</code> on the LoanPouchEscrow contract.
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full py-3 rounded-xl font-medium transition-all ${isValid ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              {isValid ? "Submit Recovery Request" : "Fill in wallet addresses to continue"}
            </button>

            <p className="text-center text-sm text-gray-500">
              New user?{" "}
              <Link href="/register" className="text-black font-medium hover:underline">Create a Wallet</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
