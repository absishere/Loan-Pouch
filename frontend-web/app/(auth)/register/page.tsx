"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type StepStatus = "idle" | "uploaded" | "verified";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step-level completion state
  const [aadhaarDone, setAadhaarDone] = useState(false);
  const [panDone, setPanDone] = useState(false);
  const [mobileDone, setMobileDone] = useState(false);
  const [faceDone, setFaceDone] = useState(false);
  const [mpin, setMpin] = useState("");
  const [tpin, setTpin] = useState("");

  const mobileRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  // Per-step validation
  const canContinue = () => {
    if (step === 1) return aadhaarDone;
    if (step === 2) return panDone;
    if (step === 3) return mobileDone;
    if (step === 4) return faceDone;
    if (step === 5) return mpin.length === 6 && tpin.length === 6;
    return false;
  };

  const handleNext = () => {
    if (!canContinue()) return;
    if (step < 5) {
      setStep(step + 1);
    } else {
      // ✅ Mark registration complete → allow dashboard access
      localStorage.setItem("lp_wallet_registered", "true");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-syne mb-2">Get Started</h1>
          <p className="text-gray-600">Complete KYC verification to create your biometric wallet</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${s <= step ? "bg-black text-white" : "bg-gray-200 text-gray-600"}`}>
                {s}
              </div>
              {s < 5 && <div className={`w-12 h-0.5 ${s < step ? "bg-black" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">

          {/* Step 1 — Aadhaar */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Aadhaar Verification</h2>
              <label className="block text-sm font-medium mb-2">Upload Aadhaar Card</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${aadhaarDone ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={() => setAadhaarDone(true)} />
                {aadhaarDone
                  ? <><span className="text-3xl mb-2">✅</span><p className="text-green-700 font-medium">Aadhaar uploaded successfully</p></>
                  : <><span className="text-3xl mb-2">📄</span><p className="text-gray-600">Click to upload Aadhaar (JPG, PNG, PDF)</p></>
                }
              </label>
            </div>
          )}

          {/* Step 2 — PAN */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">PAN Verification</h2>
              <label className="block text-sm font-medium mb-2">Upload PAN Card</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${panDone ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={() => setPanDone(true)} />
                {panDone
                  ? <><span className="text-3xl mb-2">✅</span><p className="text-green-700 font-medium">PAN uploaded successfully</p></>
                  : <><span className="text-3xl mb-2">💳</span><p className="text-gray-600">Click to upload PAN Card (JPG, PNG, PDF)</p></>
                }
              </label>
            </div>
          )}

          {/* Step 3 — Mobile/OTP */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Mobile Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <input ref={mobileRef} type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">OTP</label>
                  <div className="flex gap-3">
                    <input ref={otpRef} type="text" maxLength={6} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" placeholder="Enter 6-digit OTP" onChange={(e) => { if (e.target.value.length === 6) setMobileDone(true); else setMobileDone(false); }} />
                    <button type="button" className="px-4 py-3 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 whitespace-nowrap" onClick={() => { if (mobileRef.current?.value) alert("OTP sent! Use 123456 for demo."); }}>
                      Send OTP
                    </button>
                  </div>
                </div>
                {mobileDone && <p className="text-green-600 text-sm font-medium">✅ Mobile verified</p>}
              </div>
            </div>
          )}

          {/* Step 4 — Face */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Face Verification</h2>
              <div className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${faceDone ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400"}`} onClick={() => !faceDone && setFaceDone(true)}>
                {faceDone
                  ? <><div className="text-5xl mb-3">✅</div><p className="text-green-700 font-medium">Face scan complete</p></>
                  : <><div className="w-28 h-28 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center text-4xl">📷</div><p className="text-gray-600">Click to capture live selfie</p><p className="text-xs text-gray-400 mt-1">Your biometric data never leaves this device</p></>
                }
              </div>
            </div>
          )}

          {/* Step 5 — PINs */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Set Security PINs</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">mPIN — Login (6 digits)</label>
                  <input type="password" inputMode="numeric" maxLength={6} value={mpin} onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black tracking-widest text-center text-2xl" placeholder="• • • • • •" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">tPIN — Transactions (6 digits)</label>
                  <input type="password" inputMode="numeric" maxLength={6} value={tpin} onChange={(e) => setTpin(e.target.value.replace(/\D/g, ""))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black tracking-widest text-center text-2xl" placeholder="• • • • • •" />
                </div>
              </div>
            </div>
          )}

          {/* Continue Button — disabled until step requirements met */}
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className={`w-full mt-6 py-3 rounded-xl font-medium transition-all ${canContinue() ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            {!canContinue()
              ? step === 1 ? "Upload Aadhaar to continue"
              : step === 2 ? "Upload PAN to continue"
              : step === 3 ? "Enter OTP to continue"
              : step === 4 ? "Scan your face to continue"
              : "Enter both PINs to continue"
              : step === 5 ? "Generate Biometric Wallet 🔐" : "Continue →"
            }
          </button>

          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="mt-4 text-gray-600 hover:text-black text-sm">
              ← Back
            </button>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          Lost your wallet?{" "}
          <Link href="/recovery" className="text-black font-medium hover:underline">
            Recover via Guardians
          </Link>
        </div>
      </div>
    </div>
  );
}
