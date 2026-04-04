"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileUp, CheckCircle, AlertCircle, Loader2, Smartphone, ShieldCheck, Mail } from "lucide-react";
import { performDocumentOCR, fileToBase64 } from "@/lib/services/GeminiService";
import { loadModels, verifyIdentity } from "@/lib/services/FaceService";
import { auth } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Profile Data
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    aadhaar: "",
    pan: "",
    phone: "",
    aadhaarImage: null as string | null,
    panImage: null as string | null,
    selfieImage: null as string | null,
    mpin: "",
    tpin: "",
  });

  // Step Statuses
  const [aadhaarDone, setAadhaarDone] = useState(false);
  const [panDone, setPanDone] = useState(false);
  const [mobileDone, setMobileDone] = useState(false);
  const [faceDone, setFaceDone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionInfo, setSessionInfo] = useState("");

  // Refs for camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (step === 4) {
      loadModels().catch(console.error);
    }
  }, [step]);

  // Handle Aadhaar Upload & OCR
  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError(null);
      try {
        const file = e.target.files[0];
        const base64 = await fileToBase64(file);
        const result = await performDocumentOCR(base64, file.type);
        
        if (result.documentType === "Aadhar") {
          setProfile(prev => ({
            ...prev,
            name: result.name,
            dob: result.dob,
            aadhaar: result.documentNumber,
            aadhaarImage: base64
          }));
          setAadhaarDone(true);
        } else {
          setError("Please upload a valid Aadhaar card.");
        }
      } catch (err: any) {
        setError(err.message || "OCR failed. Please try again or fill manually.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle PAN Upload & OCR
  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError(null);
      try {
        const file = e.target.files[0];
        const base64 = await fileToBase64(file);
        const result = await performDocumentOCR(base64, file.type);
        
        if (result.documentType === "PAN") {
          setProfile(prev => ({
            ...prev,
            pan: result.documentNumber,
            panImage: base64
          }));
          setPanDone(true);
        } else {
          setError("Please upload a valid PAN card.");
        }
      } catch (err: any) {
        setError(err.message || "OCR failed. Please try again or fill manually.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle OTP
  const handleSendOtp = async () => {
    if (!profile.phone || profile.phone.length < 10) {
      setError("Enter a valid mobile number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await auth.sendOtp(profile.phone);
      setSessionInfo(res.session_info);
      setOtpSent(true);
      alert("OTP sent! For demo/testing use code 123456.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.verifyOtp(sessionInfo, otpCode);
      setMobileDone(true);
    } catch (err: any) {
      setError("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Face Verification
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError("Camera access denied.");
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !profile.aadhaarImage) return;
    setIsMatching(true);
    setError(null);
    try {
      // Create a temporary image element for the Aadhaar photo
      const idImg = new Image();
      idImg.src = `data:image/jpeg;base64,${profile.aadhaarImage}`;
      await new Promise(resolve => idImg.onload = resolve);

      const result = await verifyIdentity(videoRef.current, idImg);
      if (result.match) {
        setFaceDone(true);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      } else {
        setError(`Face mismatch (Confidence: ${result.confidence.toFixed(1)}%). Please try again.`);
      }
    } catch (err) {
      setError("Verification failed. Ensure your face is visible.");
    } finally {
      setIsMatching(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return aadhaarDone;
    if (step === 2) return panDone;
    if (step === 3) return mobileDone;
    if (step === 4) return faceDone;
    if (step === 5) return profile.mpin.length === 6 && profile.tpin.length === 6;
    return false;
  };

  const handleNext = () => {
    if (!canContinue()) return;
    if (step < 5) {
      setStep(step + 1);
      setError(null);
    } else {
      // Finalize Registration
      const userProfile = {
        ...profile,
        trustScore: 400, // Initial trust score
        walletAddress: "0x" + Math.random().toString(16).slice(2, 42), // Mock wallet
        joined: new Date().toISOString(),
      };
      localStorage.setItem("lp_user_profile", JSON.stringify(userProfile));
      localStorage.setItem("lp_wallet_registered", "true");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black font-syne mb-2 tracking-tight">Create Biometric Wallet</h1>
          <p className="text-gray-600 font-medium">Verify your identity to join Loan Pouch</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${s <= step ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-200"}`}>
                {s}
              </div>
              {s < 5 && <div className={`w-8 h-1 mx-1 rounded-full ${s < step ? "bg-black" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {error && (
            <div className="bg-red-50 p-4 rounded-xl mb-6 flex items-start text-red-700 border border-red-200 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Step 1 — Aadhaar */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ShieldCheck size={24} /></div>
                <h2 className="text-2xl font-black font-syne">Aadhaar Verification</h2>
              </div>
              
              {!aadhaarDone ? (
                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl p-12 cursor-pointer hover:border-black hover:bg-gray-50 transition-all group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarUpload} disabled={loading} />
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-16 h-16 animate-spin text-black mb-4" />
                      <p className="font-bold text-gray-600">Running Gemini Vision OCR...</p>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-20 h-20 text-gray-300 group-hover:text-black mb-4 transition-colors" />
                      <p className="text-xl font-bold mb-2">Upload Aadhaar Front</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG up to 10MB</p>
                    </>
                  )}
                </label>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 flex items-center gap-4">
                    <CheckCircle className="text-emerald-500 w-10 h-10" />
                    <div>
                      <p className="text-emerald-900 font-black text-lg">Aadhaar Verified</p>
                      <p className="text-emerald-700 font-medium">Data extracted successfully</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase">Name</p>
                      <p className="font-bold">{profile.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase">Number</p>
                      <p className="font-bold">{profile.aadhaar}</p>
                    </div>
                  </div>
                  <button onClick={() => setAadhaarDone(false)} className="text-sm font-bold text-gray-500 hover:text-black transition-colors underline">Use a different image</button>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — PAN */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Mail size={24} /></div>
                <h2 className="text-2xl font-black font-syne">PAN Verification</h2>
              </div>
              
              {!panDone ? (
                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl p-12 cursor-pointer hover:border-black hover:bg-gray-50 transition-all group">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePanUpload} disabled={loading} />
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-16 h-16 animate-spin text-black mb-4" />
                      <p className="font-bold text-gray-600">Running Gemini Vision OCR...</p>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-20 h-20 text-gray-300 group-hover:text-black mb-4 transition-colors" />
                      <p className="text-xl font-bold mb-2">Upload PAN Card</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG up to 10MB</p>
                    </>
                  )}
                </label>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 flex items-center gap-4">
                    <CheckCircle className="text-emerald-500 w-10 h-10" />
                    <div>
                      <p className="text-emerald-900 font-black text-lg">PAN Verified</p>
                      <p className="text-emerald-700 font-medium">Tax ID validated</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">PAN Number</p>
                    <p className="font-bold">{profile.pan}</p>
                  </div>
                  <button onClick={() => setPanDone(false)} className="text-sm font-bold text-gray-500 hover:text-black transition-colors underline">Use a different image</button>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Mobile */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Smartphone size={24} /></div>
                <h2 className="text-2xl font-black font-syne">Mobile Verification</h2>
              </div>

              {!mobileDone ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">Mobile Number</label>
                    <div className="flex gap-4">
                      <input 
                        type="tel" 
                        value={profile.phone} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="+91 9876543210" 
                        disabled={otpSent || loading}
                        className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 font-bold outline-none focus:border-black transition-all"
                      />
                      {!otpSent && (
                        <button 
                          onClick={handleSendOtp} 
                          disabled={loading || !profile.phone}
                          className="bg-black text-white px-8 rounded-2xl font-bold hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all disabled:opacity-50"
                        >
                          Send
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">Enter 6-digit OTP</label>
                        <input 
                          type="text" 
                          maxLength={6} 
                          value={otpCode} 
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 font-bold tracking-[1em] text-center text-2xl outline-none focus:border-black transition-all" 
                        />
                      </div>
                      <button 
                        onClick={handleVerifyOtp} 
                        disabled={loading || otpCode.length < 6}
                        className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Connect"}
                      </button>
                      <button onClick={() => setOtpSent(false)} className="w-full text-sm font-bold text-gray-500 hover:text-black">Change number</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 flex items-center gap-4 animate-in zoom-in-95 duration-300">
                  <CheckCircle className="text-emerald-500 w-10 h-10" />
                  <div>
                    <p className="text-emerald-900 font-black text-lg">Mobile Linked</p>
                    <p className="text-emerald-700 font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Face */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><Camera size={24} /></div>
                <h2 className="text-2xl font-black font-syne">Face Match</h2>
              </div>

              {!faceDone ? (
                <div className="text-center">
                  <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] mb-8 bg-gray-100 flex items-center justify-center">
                    {!stream && (
                      <button onClick={startCamera} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                        <Camera size={20} /> Open Camera
                      </button>
                    )}
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${!stream ? 'hidden' : ''}`}
                      style={{ transform: 'scaleX(-1)' }} 
                    />
                  </div>
                  
                  {stream && (
                    <button 
                      onClick={captureAndVerify} 
                      disabled={isMatching}
                      className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all flex justify-center items-center gap-3"
                    >
                      {isMatching ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Analyzing Biometrics...
                        </>
                      ) : (
                        <>
                          Verify Identity
                        </>
                      )}
                    </button>
                  )}
                  <p className="mt-4 text-sm text-gray-500 font-medium italic">Comparing live feed with Aadhaar photo</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-white w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-900 mb-2">Identity Confirmed</h3>
                  <p className="text-emerald-700 font-medium">Your live biometric data matches your ID document.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5 — Security */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><ShieldCheck size={24} /></div>
                <h2 className="text-2xl font-black font-syne">Security Setup</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">mPIN — For App Login</label>
                  <input 
                    type="password" 
                    inputMode="numeric" 
                    maxLength={6} 
                    value={profile.mpin} 
                    onChange={(e) => setProfile({...profile, mpin: e.target.value.replace(/\D/g, "")})} 
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 font-bold tracking-[1em] text-center text-3xl outline-none focus:border-black transition-all" 
                    placeholder="••••••" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-wider">tPIN — For Transactions</label>
                  <input 
                    type="password" 
                    inputMode="numeric" 
                    maxLength={6} 
                    value={profile.tpin} 
                    onChange={(e) => setProfile({...profile, tpin: e.target.value.replace(/\D/g, "")})} 
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 font-bold tracking-[1em] text-center text-3xl outline-none focus:border-black transition-all" 
                    placeholder="••••••" 
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 font-medium flex gap-3">
                  <ShieldCheck className="flex-shrink-0" />
                  These PINs secure your biometric wallet. Never share them with anyone.
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleNext}
            disabled={!canContinue() || loading}
            className={`w-full mt-10 py-5 rounded-2xl font-black text-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${canContinue() ? "bg-black text-white hover:bg-gray-800 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {step < 5 ? "Continue →" : "Generate Wallet 🔐"}
          </button>

          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full mt-4 text-gray-500 font-bold hover:text-black transition-colors">
              ← Go back to previous step
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 font-medium">Already have a wallet? <Link href="/login" className="text-black font-black hover:underline underline-offset-4">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
