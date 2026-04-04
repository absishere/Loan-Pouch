"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { performDocumentOCR, fileToBase64 } from '@/lib/services/GeminiService';
import { loadModels, verifyIdentity } from '@/lib/services/FaceService';
import { useRouter } from 'next/navigation';

export default function LoginKYC() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState({ name: '', dob: '', documentNumber: '', documentType: '' });
  
  // Face matching state
  const videoRef = useRef<HTMLVideoElement>(null);
  const idImageRef = useRef<HTMLImageElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ match: boolean; confidence: number } | null>(null);

  useEffect(() => {
    // Preload models for face-api
    loadModels().catch(console.error);
    return () => {
      // cleanup stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdImage(file);
      const previewUrl = URL.createObjectURL(file);
      setIdImagePreview(previewUrl);
      setError(null);
      
      // Start extraction
      setIsExtracting(true);
      setStep(2);
      try {
        const base64 = await fileToBase64(file);
        const result = await performDocumentOCR(base64, file.type);
        setDetails(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to extract details");
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const confirmDetails = () => {
    setStep(3);
    startCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access denied or unavailable.");
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !idImageRef.current) return;
    
    setIsMatching(true);
    setError(null);
    try {
      const result = await verifyIdentity(videoRef.current, idImageRef.current);
      if (result.error) {
        setError(result.error);
      } else {
        setMatchResult(result as {match: boolean, confidence: number});
        setStep(4);
      }
    } catch (err) {
      setError("Failed to run face verification. Ensure camera is active.");
      console.error(err);
    } finally {
      setIsMatching(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
        
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black font-syne mb-2 tracking-tight">Login Verification</h1>
            <p className="text-gray-600">Complete Biometric E-KYC to access Loan Pouch</p>
        </div>

        {/* Stepper Header */}
        <div className="flex mb-8 justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                step >= s 
                  ? 'border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {s}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl mb-6 flex items-start text-red-700 border border-red-200">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl hover:border-black transition-colors cursor-pointer bg-gray-50 relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <FileUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold font-syne mb-2">Upload Aadhar or PAN</h3>
            <p className="text-sm text-gray-500 mb-6">JPEG, PNG up to 5MB</p>
            <div className="inline-block bg-black text-white px-8 py-3 rounded-xl font-bold hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all">
              Select Document
            </div>
          </div>
        )}

        {/* Step 2: Extraction */}
        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 aspect-[3/4] flex items-center justify-center p-4">
              {idImagePreview && <img ref={idImageRef} src={idImagePreview} className="max-h-full max-w-full object-contain rounded-xl" alt="ID Document" crossOrigin="anonymous" />}
            </div>
            
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold font-syne mb-6">Extracted Data</h3>
              
              {isExtracting ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" />
                  <span className="font-bold text-gray-600 animate-pulse">Running OCR Model...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Full Name</label>
                    <input type="text" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none font-bold focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">DOB</label>
                    <input type="text" value={details.dob} onChange={e => setDetails({...details, dob: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none font-bold focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">{details.documentType || 'Document'} Number</label>
                    <input type="text" value={details.documentNumber} onChange={e => setDetails({...details, documentNumber: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none font-bold focus:border-black transition-colors" />
                  </div>
                  
                  <button onClick={confirmDetails} className="w-full mt-6 bg-black text-white font-bold py-4 rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all">
                    Confirm & Proceed
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Selfie */}
        {step === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-bold font-syne mb-2">Live Face Match</h3>
            <p className="text-gray-600 mb-8 font-medium">Position your face clearly to authenticate.</p>
            
            <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] mb-8 bg-gray-100 flex items-center justify-center">
                 {!stream && <Camera className="w-12 h-12 text-gray-300" />}
                 <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className={`w-full h-full object-cover ${!stream ? 'hidden' : ''}`}
                     style={{ transform: 'scaleX(-1)' }} 
                 />
            </div>

            <button 
                 onClick={captureAndVerify} 
                 disabled={isMatching || !stream}
                 className="bg-black text-white font-bold py-4 px-12 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 transition-all w-full md:w-auto flex justify-center items-center mx-auto"
            >
                {isMatching ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Match Analysis...</>
                ) : "Verify Identity"}
            </button>
            <img ref={idImageRef} src={idImagePreview!} className="hidden" crossOrigin="anonymous" />
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && matchResult && (
          <div className="text-center py-8">
            {matchResult.match ? (
                 <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200">
                     <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                     <h2 className="text-3xl font-black font-syne text-emerald-900 mb-2 tracking-tight">Identity Secured</h2>
                     <p className="text-emerald-700 mb-8 font-medium">Authentication successful! Your biometric lock has been verified.</p>
                     <button onClick={() => router.push('/dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition w-full shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] hover:-translate-y-1">
                        Enter Dashboard
                     </button>
                 </div>
            ) : (
                 <div className="bg-red-50 p-8 rounded-3xl border border-red-200">
                     <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                     <h2 className="text-3xl font-black font-syne text-red-900 mb-2 tracking-tight">Match Failed</h2>
                     <p className="text-red-700 mb-8 font-medium">The live feed does not match the provided ID. Access Deprived.</p>
                     <button onClick={() => setStep(3)} className="bg-white border-2 border-red-500 text-red-600 font-bold py-4 px-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] hover:-translate-y-1 transition-all w-full">
                        Retry Biometrics
                     </button>
                 </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
