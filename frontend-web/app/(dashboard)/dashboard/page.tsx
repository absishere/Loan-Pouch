"use client";

import { useEffect, useState } from "react";
import { formatCurrency, getTrustScoreTier, calculateInterestRate, formatDate } from "@/lib/utils";
import { Bell, Activity, Globe, Scale, Users, ArrowUpRight, X } from "lucide-react";
import { ethers } from "ethers";

export default function DashboardPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fiat OnRamp State
  const [showOnramp, setShowOnramp] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [minting, setMinting] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lp_user_profile");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // Expose the mock Fiat pipeline via Ethers BrowserProvider
  const handleMintBinr = async () => {
    if (!(window as any).ethereum) return alert("Please install MetaMask!");
    setMinting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const binrAddress = process.env.NEXT_PUBLIC_BINR_ADDRESS || "0x6e215881860d93a63Bf3CEb3EB2031F8c925c22e"; 
      const binrAbi = ["function faucetMint(address to, uint256 amount) public"];
      
      const contract = new ethers.Contract(binrAddress, binrAbi, signer);
      const tx = await contract.faucetMint(await signer.getAddress(), ethers.parseUnits(depositAmount.toString(), 18));
      await tx.wait();
      
      alert(`Successfully minted ${depositAmount} LP-INR to your wallet!`);
      setShowOnramp(false);
    } catch (error) {
      console.error(error);
      alert("Minting failed. Ensure MetaMask is connected to Sepolia.");
    } finally {
      setMinting(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/loans/");
        if (!res.ok) throw new Error("API Offline");
        const data = await res.json();
        setLoans(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalMarketValue = loans.reduce((acc, curr) => acc + (curr.target_amount / 1e18), 0);
  const activeLenders = new Set(loans.map(l => l.borrower)).size + new Set(loans.flatMap(l => l.guardians)).size;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fiat OnRamp Modal */}
      {showOnramp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg">Fiat On-Ramp</h3>
               <button onClick={() => setShowOnramp(false)} className="text-gray-500 hover:text-black">
                 <X size={20} />
               </button>
             </div>
             
             <p className="text-sm text-gray-500 mb-6">Connect your bank account or test UPI to purchase B-INR stablecoins directly to your Web3 wallet.</p>
             
             <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
             </div>

             {depositAmount < 100000 ? (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center">
                   <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg mb-2">
                      <span className="text-xs text-gray-400 font-mono">DUMMY UPI QR</span>
                   </div>
                   <p className="text-xs font-medium">Scan to pay via GPay / PhonePe</p>
                </div>
             ) : (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                   <p className="text-xs font-bold text-gray-500 mb-1">RTGS / NEFT transfer detail</p>
                   <p className="text-sm font-mono bg-white p-2 border rounded">Acc: 7789102930192</p>
                   <p className="text-sm font-mono bg-white p-2 border rounded mt-1">IFSC: HDFC0001234</p>
                </div>
             )}

             <button 
               onClick={handleMintBinr}
               disabled={minting}
               className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
             >
               {minting ? "Minting to Wallet..." : "I have made the payment"}
             </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-syne">Welcome, {user ? user.name : "Member"} 👋</h1>
            <p className="text-sm text-gray-600">GlobalSepolia Testnet Overview</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowOnramp(true)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Total Market Value</span>
              <Globe size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{totalMarketValue.toFixed(1)} ETH</p>
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
            <p className="text-xl lg:text-3xl font-bold font-syne">{activeLenders}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-gray-600">Fully Funded</span>
              <ArrowUpRight size={16} className="text-gray-400" />
            </div>
            <p className="text-xl lg:text-3xl font-bold font-syne">{loans.filter(l => l.state >= 2).length}</p>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6">
              <h2 className="text-lg font-bold font-syne mb-4">Recent Global Actions</h2>
              <div className="space-y-3">
                {loans.slice(-5).reverse().map((loan, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Borrower: {loan.borrower.substring(0,8)}...</p>
                      <p className="text-xs text-gray-600">ID: {loan.id} • Guardians: {loan.guardians.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-syne">{(loan.target_amount / 1e18).toFixed(2)} ETH</p>
                      <p className="text-xs text-blue-600">Funded: {(loan.gathered_amount / 1e18).toFixed(2)} ETH</p>
                    </div>
                  </div>
                ))}
                {loans.length === 0 && !loading && (
                   <p className="text-gray-500 text-sm">No live loans yet.</p>
                )}
                {loading && (
                   <div className="flex justify-center p-4"><Activity className="animate-pulse text-gray-400" /></div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-xl p-4 lg:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
              <p className="text-sm opacity-75 mb-2">Smart Contract State</p>
              <p className="text-2xl lg:text-3xl font-bold font-syne mb-4">Synced</p>
              <div className="text-xs opacity-75 mb-4 font-mono truncate">LoanPouchEscrow.sol</div>
              <p className="text-sm text-gray-300 leading-relaxed">
                All data on this dashboard is pulled dynamically from the Sepolia testnet nodes. Loan creation, biometric signing, and approvals flow purely via verified decentralised state machines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
