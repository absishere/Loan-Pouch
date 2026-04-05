"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";

import { auth } from "@/lib/api";

export default function RecoveryPage() {
  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [lostWallet, setLostWallet] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [guaranter1, setGuaranter1] = useState("");
  const [guaranter2, setGuaranter2] = useState("");
  const [guaranter3, setGuaranter3] = useState("");
  const [requestId, setRequestId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValidAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());
  const isValid =
    phone.length >= 10 &&
    mpin.length >= 4 &&
    isValidAddress(lostWallet) &&
    isValidAddress(newWallet) &&
    isValidAddress(guaranter1) &&
    isValidAddress(guaranter2) &&
    isValidAddress(guaranter3);

  useEffect(() => {
    if (!requestId) return;
    const timer = setInterval(async () => {
      try {
        const s = await auth.getRecoveryStatus(requestId);
        setStatus(s.status);
      } catch {
        // no-op
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [requestId]);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await auth.initRecovery({
        phone,
        mpin,
        lost_wallet: lostWallet,
        new_wallet: newWallet,
        guaranters: [guaranter1, guaranter2, guaranter3],
      });
      setRequestId(res.request_id);
      setStatus(res.status);
    } catch (e: any) {
      setError(e?.message || "Failed to create recovery request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-syne flex items-center gap-2">
              <ShieldCheck size={28} /> Recover Lost Wallet
            </h1>
            <p className="text-gray-600 text-sm mt-1">Stored on backend and recoverable from any device after 2-of-3 guaranter approvals.</p>
          </div>
        </div>

        {requestId ? (
          <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold font-syne mb-2">Recovery Request Submitted</h2>
            <p className="text-sm text-gray-600 mb-2">Request ID: {requestId}</p>
            <p className="text-sm text-gray-600 mb-6">Status: <span className="font-bold uppercase">{status}</span></p>
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-gray-500 mb-1 font-medium">New Wallet</p>
              <p className="font-mono text-sm break-all">{newWallet}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Ask your guaranters to open the Guaranter Console and approve this recovery.
            </p>
            <Link href="/login" className="block w-full py-3 bg-black text-white rounded-xl text-center font-medium hover:bg-gray-800">
              Go To Login
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium mb-2">Registered Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">mPIN</label>
              <input type="password" value={mpin} onChange={(e) => setMpin(e.target.value)} placeholder="Enter mPIN" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lost Wallet Address</label>
              <input type="text" value={lostWallet} onChange={(e) => setLostWallet(e.target.value)} placeholder="0x..." className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Wallet Address</label>
              <input type="text" value={newWallet} onChange={(e) => setNewWallet(e.target.value)} placeholder="0x..." className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} />
                <label className="text-sm font-medium">Guaranter Wallet Addresses (2 of 3 required)</label>
              </div>
              <div className="space-y-2">
                <input type="text" value={guaranter1} onChange={(e) => setGuaranter1(e.target.value)} placeholder="Guaranter 1 (0x...)" className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm" />
                <input type="text" value={guaranter2} onChange={(e) => setGuaranter2(e.target.value)} placeholder="Guaranter 2 (0x...)" className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm" />
                <input type="text" value={guaranter3} onChange={(e) => setGuaranter3(e.target.value)} placeholder="Guaranter 3 (0x...)" className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm" />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`w-full py-3 rounded-xl font-medium transition-all ${isValid ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              {loading ? "Submitting..." : "Submit Recovery Request"}
            </button>

            <p className="text-center text-sm text-gray-500">
              New user? <Link href="/register" className="text-black font-medium hover:underline">Create a Wallet</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
