"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle, FileUp, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { ethers } from "ethers";

import { auth } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";
import { performDocumentOCR, fileToBase64 } from "@/lib/services/GeminiService";
import { loadModels, verifyIdentity } from "@/lib/services/FaceService";

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    aadhaar: "",
    pan: "",
    phone: "",
    aadhaarImage: null as string | null,
    mpin: "",
    tpin: "",
  });

  const [aadhaarDone, setAadhaarDone] = useState(false);
  const [panDone, setPanDone] = useState(false);
  const [mobileDone, setMobileDone] = useState(false);
  const [faceDone, setFaceDone] = useState(false);
  const [sessionInfo, setSessionInfo] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === 4) {
      loadModels().catch(() => null);
    }
  }, [step]);

  const canContinue = () => {
    if (step === 1) return aadhaarDone;
    if (step === 2) return panDone;
    if (step === 3) return mobileDone;
    if (step === 4) return faceDone;
    if (step === 5) return profile.mpin.length === 6 && profile.tpin.length === 6 && profile.mpin !== profile.tpin;
    return false;
  };

  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const result = await performDocumentOCR(base64, file.type);
      setProfile((prev) => ({
        ...prev,
        name: result.name || prev.name,
        dob: result.dob || prev.dob,
        aadhaar: result.documentNumber || prev.aadhaar,
        aadhaarImage: base64,
      }));
      setAadhaarDone(true);
    } catch {
      setError("OCR failed. You can enter details manually.");
    } finally {
      setLoading(false);
    }
  };

  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const result = await performDocumentOCR(base64, file.type);
      setProfile((prev) => ({ ...prev, pan: result.documentNumber || prev.pan }));
      setPanDone(true);
    } catch {
      setError("OCR failed. You can enter PAN manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!profile.phone || profile.phone.length < 10) {
      setError("Enter a valid mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await auth.sendOtp(profile.phone);
      setSessionInfo(res.session_info);
      setOtpSent(true);
      alert("OTP sent. For demo use code 123456.");
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
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
    } catch {
      setError("Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError("Camera access denied");
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !profile.aadhaarImage) return;
    setLoading(true);
    setError(null);
    try {
      const idImg = new Image();
      idImg.src = `data:image/jpeg;base64,${profile.aadhaarImage}`;
      await new Promise((resolve) => {
        idImg.onload = () => resolve(true);
      });

      const result = await verifyIdentity(videoRef.current, idImg);
      if (!result.match) {
        setError(`Face mismatch (${result.confidence.toFixed(1)}%)`);
        return;
      }
      setFaceDone(true);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!canContinue()) return;
    if (step < 5) {
      setStep(step + 1);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const walletAddress = ethers.Wallet.createRandom().address;
      const canonicalDoc = [
        profile.name.trim().toLowerCase(),
        profile.dob.replace(/\D/g, ""),
        profile.aadhaar.replace(/\D/g, ""),
        profile.pan.trim().toUpperCase(),
      ].join("|");
      const docHash = await sha256Hex(canonicalDoc);
      const reg = await auth.registerUser({
        name: profile.name,
        phone: profile.phone,
        mpin: profile.mpin,
        wallet_address: walletAddress,
        doc_hash: docHash,
        trust_score: 400,
      });

      setCurrentUser({
        name: profile.name,
        phoneLast4: reg.phone_last4,
        trustScore: reg.trust_score,
        walletAddress: reg.wallet_address,
        joined: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black font-syne mb-2 tracking-tight">Create Biometric Wallet</h1>
          <p className="text-gray-600 font-medium">No raw document details are stored in local storage.</p>
        </div>

        <div className="flex items-center justify-center mb-10 gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                  s <= step ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                {s}
              </div>
              {s < 5 && <div className={`w-8 h-1 mx-1 rounded-full ${s < step ? "bg-black" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {error && (
            <div className="bg-red-50 p-4 rounded-xl mb-6 flex items-start text-red-700 border border-red-200">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne flex items-center gap-2"><ShieldCheck size={22} /> Aadhaar Verification</h2>
              {!aadhaarDone ? (
                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl p-10 cursor-pointer hover:border-black">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarUpload} disabled={loading} />
                  {loading ? <Loader2 className="w-12 h-12 animate-spin" /> : <FileUp className="w-16 h-16 text-gray-400" />}
                  <p className="mt-3 font-bold">Upload Aadhaar</p>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3"><CheckCircle /> Aadhaar processed</div>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Full name" />
                  <input value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="DOB" />
                  <input value={profile.aadhaar} onChange={(e) => setProfile({ ...profile, aadhaar: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Aadhaar number" />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne">PAN Verification</h2>
              {!panDone ? (
                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl p-10 cursor-pointer hover:border-black">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePanUpload} disabled={loading} />
                  {loading ? <Loader2 className="w-12 h-12 animate-spin" /> : <FileUp className="w-16 h-16 text-gray-400" />}
                  <p className="mt-3 font-bold">Upload PAN</p>
                </label>
              ) : (
                <input value={profile.pan} onChange={(e) => setProfile({ ...profile, pan: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="PAN number" />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne flex items-center gap-2"><Smartphone size={22} /> Mobile Verification</h2>
              {!mobileDone ? (
                <>
                  <div className="flex gap-2">
                    <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="flex-1 border rounded-lg px-4 py-2" placeholder="+91XXXXXXXXXX" />
                    {!otpSent && <button onClick={handleSendOtp} className="bg-black text-white px-4 py-2 rounded-lg">Send OTP</button>}
                  </div>
                  {otpSent && (
                    <div className="space-y-2">
                      <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full border rounded-lg px-4 py-2" placeholder="Enter OTP" />
                      <button onClick={handleVerifyOtp} className="w-full bg-black text-white py-2 rounded-lg">Verify OTP</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3"><CheckCircle /> Mobile linked</div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne flex items-center gap-2"><Camera size={22} /> Face Match</h2>
              {!faceDone ? (
                <>
                  <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-black bg-gray-100 flex items-center justify-center">
                    {!stream && <button onClick={startCamera} className="bg-black text-white px-4 py-2 rounded-lg">Open Camera</button>}
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!stream ? "hidden" : ""}`} />
                  </div>
                  {stream && <button onClick={captureAndVerify} className="w-full bg-black text-white py-2 rounded-lg">Verify Face</button>}
                </>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3"><CheckCircle /> Identity confirmed</div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne">Security Setup</h2>
              <input
                type="password"
                maxLength={6}
                value={profile.mpin}
                onChange={(e) => setProfile({ ...profile, mpin: e.target.value.replace(/\D/g, "") })}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="mPIN"
              />
              <input
                type="password"
                maxLength={6}
                value={profile.tpin}
                onChange={(e) => setProfile({ ...profile, tpin: e.target.value.replace(/\D/g, "") })}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="tPIN"
              />
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={!canContinue() || loading}
            className={`w-full mt-10 py-4 rounded-2xl font-black transition-all ${
              canContinue() ? "bg-black text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {step < 5 ? "Continue" : "Generate Wallet"}
          </button>

          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full mt-3 text-gray-500 font-bold hover:text-black transition-colors">
              Back
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 font-medium">
            Already have a wallet?{" "}
            <Link href="/login" className="text-black font-black hover:underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

