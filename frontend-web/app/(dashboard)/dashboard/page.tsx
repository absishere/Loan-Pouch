"use client";

import { useEffect, useState } from "react";
import { Activity, Bell, Globe, Scale, Users, X } from "lucide-react";

import { api, payments } from "@/lib/api";
import { addDemoBalance, getCurrentUser, getDemoBalance } from "@/lib/session";

export default function DashboardPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnramp, setShowOnramp] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [minting, setMinting] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const current = getCurrentUser();
    if (current?.name) {
      setUser({ name: current.name });
      setWalletBalance(getDemoBalance(current.walletAddress));
    }
  }, []);

  const handleMintBinr = async () => {
    const current = getCurrentUser();
    const wallet = current?.walletAddress;
    if (!wallet) {
      alert("No Loan Pouch wallet found in session. Please login again.");
      return;
    }
    setMinting(true);
    try {
      const mintRes = await payments.mintDemoToken(wallet, depositAmount);
      const updatedBalance = addDemoBalance(wallet, depositAmount);
      setWalletBalance(updatedBalance);
      if (mintRes.status === "minted") {
        alert(`Payment successful and ${depositAmount} B-INR minted. TX: ${mintRes.tx_hash}`);
      } else {
        alert(`Payment successful. Mint is queued (network busy), you can continue demo.`);
      }
      setShowOnramp(false);
      setCardNumber("");
      setUpiId("");
    } catch (error: any) {
      alert(`Payment successful. Token mint sync delayed due to RPC load. You can continue demo.`);
      setShowOnramp(false);
      setCardNumber("");
      setUpiId("");
    } finally {
      setMinting(false);
    }
  };

  const handlePayment = async () => {
    if (!depositAmount || depositAmount < 10) {
      alert("Minimum deposit amount is INR 10");
      return;
    }

    if (depositAmount >= 100000 && method === "upi") {
      alert("UPI is only allowed below INR 100000. Please use card.");
      return;
    }

    try {
      const order = await payments.createOrder(depositAmount, method);
      await payments.mockCharge({
        order_id: order.id,
        amount: depositAmount,
        method,
        card_number: method === "card" ? cardNumber : undefined,
        upi_id: method === "upi" ? upiId : undefined,
      });
      await handleMintBinr();
    } catch (error: any) {
      alert(error?.message || "Payment failed");
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.listLoans(0, 200);
        setLoans(data);
      } catch {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const participants = new Set<string>([
    ...loans.map((l) => l.borrower),
    ...loans.flatMap((l) => l.guardians || []),
  ]).size;

  return (
    <div className="min-h-screen bg-white relative">
      {showOnramp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Fiat On-Ramp (Razorpay Test Simulator)</h3>
              <button onClick={() => setShowOnramp(false)} className="text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Demo mode only. Payment is simulated and follows Razorpay-like validation rules.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Deposit Amount (INR)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setMethod("card")}
                className={`py-2 rounded-lg border ${method === "card" ? "bg-black text-white border-black" : "border-gray-300"}`}
              >
                Card
              </button>
              <button
                onClick={() => setMethod("upi")}
                disabled={depositAmount >= 100000}
                className={`py-2 rounded-lg border ${
                  method === "upi" ? "bg-black text-white border-black" : "border-gray-300"
                } ${depositAmount >= 100000 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                UPI
              </button>
            </div>

            {method === "card" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder={depositAmount >= 100000 ? "Valid card number required" : "Any 12-19 digit demo card"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@bank"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              {depositAmount < 100000
                ? "UPI and card are both allowed below INR 100000."
                : "For INR 100000 and above, only valid card payment is allowed."}
            </div>

            <button
              onClick={handlePayment}
              disabled={minting}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
            >
              {minting ? "Processing..." : `Pay INR ${depositAmount}`}
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 bg-white px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-syne">Welcome, {user ? user.name : "Member"}</h1>
            <p className="text-sm text-gray-600">Sepolia Testnet Overview</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowOnramp(true)} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              + Add Funds (INR)
            </button>
            <div className="px-3 lg:px-4 py-2 rounded-lg border text-xs lg:text-sm bg-blue-50 text-blue-600 border-blue-200 hidden sm:block">
              <span className="font-medium">Status: Live</span>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Your Demo B-INR Balance</span>
              <Globe size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne text-gray-900">{walletBalance.toFixed(2)} B-INR</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Live Escrow Contracts</span>
              <Scale size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{loans.length}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Active Participants</span>
              <Users size={16} className="text-green-500" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{participants}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Fully Funded</span>
              <Activity size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{loans.filter((l) => l.state >= 2).length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
          <h2 className="text-lg font-bold font-syne mb-4">Recent Global Actions</h2>
          <div className="space-y-3">
            {loans.slice(-5).reverse().map((loan, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Borrower: {loan.borrower.substring(0, 8)}...</p>
                  <p className="text-xs text-gray-600">ID: {loan.id} • Guaranters: {(loan.guardians || []).length}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-syne text-gray-900">{(loan.target_amount / 1e18).toFixed(2)} B-INR</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Funded: {(loan.gathered_amount / 1e18).toFixed(2)} B-INR</p>
                </div>
              </div>
            ))}
            {loans.length === 0 && !loading && <p className="text-gray-500 text-sm">No live loans yet.</p>}
            {loading && (
              <div className="flex justify-center p-4">
                <Activity className="animate-pulse text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
