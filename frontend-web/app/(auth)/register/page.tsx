"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle, FileUp, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { ethers } from "ethers";

import { auth, getApiBaseUrl, kyc, setApiBaseUrl } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";
import { fileToBase64 } from "@/lib/services/GeminiService";
import { loadModels, verifyIdentity, verifyLivenessFromVideo } from "@/lib/services/FaceService";

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
  const [manualAadhaar, setManualAadhaar] = useState(false);
  const [manualPan, setManualPan] = useState(false);
  const [mobileDone, setMobileDone] = useState(false);
  const [faceDone, setFaceDone] = useState(false);
  const [sessionInfo, setSessionInfo] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [ocrMode, setOcrMode] = useState<"backend-gemini" | "manual">("backend-gemini");

  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [dobMonth, setDobMonth] = useState<number>(new Date().getMonth());
  const [dobYear, setDobYear] = useState<number>(new Date().getFullYear() - 20);
  const [apiUrl, setApiUrl] = useState("");

  const dataUrlFromBase64 = (rawBase64: string) => `data:image/jpeg;base64,${rawBase64}`;
  const dataUrlToBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();
  const captureVideoFrameBlob = async (video: HTMLVideoElement): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Camera canvas unavailable"));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Could not capture selfie"));
        else resolve(blob);
      }, "image/jpeg", 0.92);
    });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysInMonth = new Date(dobYear, dobMonth + 1, 0).getDate();
  const monthStartDay = new Date(dobYear, dobMonth, 1).getDay();
  const today = new Date();
  const ageGate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const pickDob = (day: number) => {
    const selected = new Date(dobYear, dobMonth, day);
    if (selected > ageGate) {
      setError("You must be at least 18 years old.");
      return;
    }
    const dd = String(day).padStart(2, "0");
    const mm = String(dobMonth + 1).padStart(2, "0");
    const yyyy = String(dobYear);
    setProfile((prev) => ({ ...prev, dob: `${dd}/${mm}/${yyyy}` }));
    setDobPickerOpen(false);
    setError(null);
  };

  useEffect(() => {
    if (step === 4) {
      loadModels().catch(() => null);
    }
  }, [step]);

  useEffect(() => {
    setApiUrl(getApiBaseUrl());
  }, []);

  const saveApiUrl = () => {
    const normalized = apiUrl.trim().replace(/\/+$/, "");
    if (!normalized) {
      setApiBaseUrl("");
      setApiUrl(getApiBaseUrl());
      setError(null);
      return;
    }
    if (!/^https?:\/\/.+/i.test(normalized)) {
      setError("Backend URL must start with http:// or https://");
      return;
    }
    setApiBaseUrl(normalized);
    setApiUrl(getApiBaseUrl());
    setError(null);
  };

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
      setProfile((prev) => ({ ...prev, aadhaarImage: base64 }));
      const result = await kyc.uploadId(file, "aadhaar");
      setProfile((prev) => ({
        ...prev,
        name: result.data?.name || prev.name,
        dob: result.data?.dob || prev.dob,
        aadhaar: result.data?.documentNumber || prev.aadhaar,
      }));
      setOcrMode("backend-gemini");
      setAadhaarDone(true);
    } catch (err: any) {
      setError(err?.message || "Gemini OCR failed. Enter details manually.");
      setManualAadhaar(true);
      setOcrMode("manual");
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
      const result = await kyc.uploadId(file, "pan");
      setProfile((prev) => ({ ...prev, pan: result.data?.documentNumber || prev.pan }));
      setPanDone(true);
    } catch (err: any) {
      setError(err?.message || "Gemini OCR failed. Enter PAN manually.");
      setManualPan(true);
    } finally {
      setLoading(false);
    }
  };

  const saveAadhaarManual = () => {
    if (!profile.name.trim() || !profile.dob.trim() || !profile.aadhaar.trim()) {
      setError("Enter name, DOB and Aadhaar number.");
      return;
    }
    if (!profile.aadhaarImage) {
      setError("Upload Aadhaar image for mandatory face verification.");
      return;
    }
    setError(null);
    setAadhaarDone(true);
  };

  const savePanManual = () => {
    const pan = profile.pan.trim().toUpperCase();
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(pan)) {
      setError("PAN must be in official format: AAAAA9999A");
      return;
    }
    setProfile((prev) => ({ ...prev, pan }));
    setError(null);
    setPanDone(true);
  };

  const handleSendOtp = async () => {
    if (!profile.phone || profile.phone.length < 10) {
      setError("Enter a valid mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const normalized = apiUrl.trim().replace(/\/+$/, "");
      if (normalized) setApiBaseUrl(normalized);
      const res = await auth.sendOtp(profile.phone);
      setSessionInfo(res.session_info);
      setOtpSent(true);
      alert("OTP sent. For demo use code 123456.");
    } catch (e: any) {
      const message = e?.message || "Failed to send OTP";
      if (String(message).toLowerCase().includes("failed to fetch")) {
        setError("Could not reach backend. Set Backend API URL to host laptop IP (example: http://192.168.1.10:8000/api).");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpCode.replace(/\D/g, "").slice(0, 6);
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await auth.verifyOtp(sessionInfo, otp);
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
    if (!videoRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const liveness = await verifyLivenessFromVideo(videoRef.current);
      if (!liveness.live) {
        setError("Liveness check failed. Move your face slightly and retry.");
        return;
      }

      if (profile.aadhaarImage) {
        const dataUrl = dataUrlFromBase64(profile.aadhaarImage);
        const idImg = new Image();
        idImg.src = dataUrl;
        await new Promise((resolve) => {
          idImg.onload = () => resolve(true);
        });
        const localMatch = await verifyIdentity(videoRef.current, idImg);
        if (!localMatch.match) {
          setError(`Face mismatch against uploaded Aadhaar photo (${localMatch.confidence.toFixed(1)}%).`);
          return;
        }

        const selfieBlob = await captureVideoFrameBlob(videoRef.current);
        const docBlob = await dataUrlToBlob(dataUrl);
        await kyc.matchFace(selfieBlob, docBlob);
      } else if (manualAadhaar) {
        // Alternate mandatory path when OCR/manual details are used without parseable document:
        // OTP + live liveness challenge still required.
        if (!mobileDone) {
          setError("OTP verification is required before liveness-only fallback.");
          return;
        }
      } else {
        setError("Upload Aadhaar image to continue face verification.");
        return;
      }

      setFaceDone(true);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    } catch (e: any) {
      setError(e?.message || "Verification failed");
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
              <p className="text-xs text-gray-500">
                OCR source: {ocrMode === "backend-gemini" ? "Backend Gemini OCR (primary)" : "Manual Entry (fallback)"}
              </p>
              {!aadhaarDone && !manualAadhaar ? (
                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl p-10 cursor-pointer hover:border-black">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarUpload} disabled={loading} />
                  {loading ? <Loader2 className="w-12 h-12 animate-spin" /> : <FileUp className="w-16 h-16 text-gray-400" />}
                  <p className="mt-3 font-bold">Upload Aadhaar</p>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3"><CheckCircle /> Aadhaar details ready</div>
                  {!profile.aadhaarImage && (
                    <label className="block border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarUpload} />
                      Upload Aadhaar Image (required for face verification)
                    </label>
                  )}
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Full name" />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDobPickerOpen((v) => !v)}
                      className="w-full border-2 border-black rounded-xl px-4 py-3 text-left bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all"
                    >
                      {profile.dob ? `DOB: ${profile.dob}` : "Pick Date of Birth"}
                    </button>
                    {dobPickerOpen && (
                      <div className="absolute z-30 mt-2 w-full bg-white border-2 border-black rounded-2xl p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (dobMonth === 0) {
                                setDobMonth(11);
                                setDobYear((y) => y - 1);
                              } else {
                                setDobMonth((m) => m - 1);
                              }
                            }}
                            className="px-2 py-1 border border-gray-300 rounded-lg"
                          >
                            ◀
                          </button>
                          <div className="flex-1 text-center font-bold">
                            {monthNames[dobMonth]} {dobYear}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (dobMonth === 11) {
                                setDobMonth(0);
                                setDobYear((y) => y + 1);
                              } else {
                                setDobMonth((m) => m + 1);
                              }
                            }}
                            className="px-2 py-1 border border-gray-300 rounded-lg"
                          >
                            ▶
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-gray-500 mb-1">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                            <div key={d} className="text-center py-1">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: monthStartDay }).map((_, i) => (
                            <div key={`blank-${i}`} />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const candidate = new Date(dobYear, dobMonth, day);
                            const blocked = candidate > ageGate;
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => pickDob(day)}
                                disabled={blocked}
                                className={`py-2 rounded-lg text-xs font-bold border ${
                                  blocked
                                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                    : "text-black border-gray-300 hover:bg-black hover:text-white"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">Only 18+ DOB is selectable.</p>
                      </div>
                    )}
                  </div>
                  <input value={profile.aadhaar} onChange={(e) => setProfile({ ...profile, aadhaar: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Aadhaar number" />
                  {!aadhaarDone && (
                    <button onClick={saveAadhaarManual} className="w-full bg-black text-white py-2 rounded-lg font-medium">
                      Save Aadhaar Details
                    </button>
                  )}
                </div>
              )}
              {!aadhaarDone && !manualAadhaar && (
                <button onClick={() => { setManualAadhaar(true); setOcrMode("manual"); setError(null); }} className="w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50">
                  Enter Aadhaar Details Manually
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne">PAN Verification</h2>
              {!panDone && !manualPan ? (
                <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-3xl p-10 cursor-pointer hover:border-black">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePanUpload} disabled={loading} />
                  {loading ? <Loader2 className="w-12 h-12 animate-spin" /> : <FileUp className="w-16 h-16 text-gray-400" />}
                  <p className="mt-3 font-bold">Upload PAN</p>
                </label>
              ) : (
                <div className="space-y-3">
                  <input
                    value={profile.pan}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                      })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="PAN number (AAAAA9999A)"
                  />
                  <p className="text-xs text-gray-500">Auto-formatted to official PAN pattern.</p>
                  {!panDone && (
                    <button onClick={savePanManual} className="w-full bg-black text-white py-2 rounded-lg font-medium">
                      Save PAN Details
                    </button>
                  )}
                </div>
              )}
              {!panDone && !manualPan && (
                <button onClick={() => { setManualPan(true); setError(null); }} className="w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50">
                  Enter PAN Details Manually
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black font-syne flex items-center gap-2"><Smartphone size={22} /> Mobile Verification</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Backend API URL (for cross-device use)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2"
                    placeholder="http://192.168.1.10:8000/api"
                  />
                  <button onClick={saveApiUrl} type="button" className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500">Use host laptop IP on your friend devices.</p>
              </div>
              {!mobileDone ? (
                <>
                  <div className="flex gap-2">
                    <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="flex-1 border rounded-lg px-4 py-2" placeholder="+91XXXXXXXXXX" />
                    {!otpSent && <button onClick={handleSendOtp} className="bg-black text-white px-4 py-2 rounded-lg">Send OTP</button>}
                  </div>
                  {otpSent && (
                    <div className="space-y-2">
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Enter 6-digit OTP"
                        inputMode="numeric"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length !== 6}
                        className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify OTP
                      </button>
                      <p className="text-xs text-gray-500">Only exactly 6 digits are accepted.</p>
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
              <p className="text-xs text-gray-500">
                Face is verified against the uploaded Aadhaar image. Manual text entry does not skip biometric matching.
              </p>
              {!faceDone ? (
                <>
                  <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-black bg-gray-100 flex items-center justify-center">
                    {!stream && <button onClick={startCamera} className="bg-black text-white px-4 py-2 rounded-lg">Open Camera</button>}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${!stream ? "hidden" : ""}`}
                      style={{ transform: "scaleX(1)" }}
                    />
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

