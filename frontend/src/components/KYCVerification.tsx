import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { performDocumentOCR, fileToBase64 } from '../services/GeminiService';
import { loadModels, verifyIdentity } from '../services/FaceService';

export default function KYCVerification() {
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
        // Preload models
        loadModels();
        return () => {
             // cleanup stream
             if (stream) {
                 stream.getTracks().forEach(track => track.stop());
             }
        };
    }, []);

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
            setError("Failed to run face verification.");
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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">E-KYC Verification</h1>
            <p className="text-gray-500 mb-8">Follow the steps below to verify your identity.</p>

            {/* Stepper Header */}
            <div className="flex mb-8 justify-between">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {s}
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start text-red-700 border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    <FileUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-mono text-gray-700 mb-2">Upload Aadhar or PAN</h3>
                    <p className="text-sm text-gray-500 mb-6">JPEG, PNG up to 5MB</p>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="document-upload"
                    />
                    <label htmlFor="document-upload" className="bg-purple-600 text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-purple-700 font-medium transition-colors">
                        Select File
                    </label>
                </div>
            )}

            {/* Step 2: Extraction */}
            {step === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 h-64 flex items-center justify-center">
                        {idImagePreview && <img ref={idImageRef} src={idImagePreview} className="max-h-full max-w-full object-contain" alt="ID Document" />}
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Extracted Details</h3>
                        
                        {isExtracting ? (
                            <div className="flex flex-col items-center justify-center h-40 text-purple-600">
                                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                <span className="font-medium animate-pulse">Extracting document details...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                                    <input type="text" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">DOB</label>
                                        <input type="text" value={details.dob} onChange={e => setDetails({...details, dob: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                                        <input type="text" value={details.documentType} onChange={e => setDetails({...details, documentType: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Document Number</label>
                                    <input type="text" value={details.documentNumber} onChange={e => setDetails({...details, documentNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 font-medium" />
                                </div>
                                <button onClick={confirmDetails} className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-purple-700 transition">
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
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Face Verification</h3>
                    <p className="text-gray-600 mb-6 font-mono text-sm">Please position your face clearly in the camera below.</p>
                    
                    <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden border-4 border-purple-500 shadow-xl mb-8 bg-gray-100 flex items-center justify-center">
                         {!stream && <Camera className="w-12 h-12 text-gray-400" />}
                         <video 
                             ref={videoRef} 
                             autoPlay 
                             playsInline 
                             muted 
                             className={`w-full h-full object-cover ${!stream ? 'hidden' : ''}`}
                             style={{ transform: 'scaleX(-1)' }} // Mirror the video
                         />
                    </div>

                    <button 
                         onClick={captureAndVerify} 
                         disabled={isMatching || !stream}
                         className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 disabled:opacity-50 transition w-full max-w-sm flex justify-center items-center mx-auto"
                    >
                        {isMatching ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Matching Faces...</>
                        ) : "Capture & Match"}
                    </button>
                    {/* Hidden image element to store the ID for face matching reference */}
                    <img ref={idImageRef} src={idImagePreview!} className="hidden" crossOrigin="anonymous" />
                </div>
            )}

            {/* Step 4: Result */}
            {step === 4 && matchResult && (
                <div className="text-center py-8">
                    {matchResult.match ? (
                         <div className="bg-green-50 p-8 rounded-2xl border border-green-200">
                             <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                             <h2 className="text-2xl font-bold text-green-800 mb-2">Verification Successful</h2>
                             <p className="text-green-700 mb-4">Your identity has been verified successfully.</p>
                             <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition w-full mt-4">
                                Continue Onboarding
                             </button>
                         </div>
                    ) : (
                         <div className="bg-red-50 p-8 rounded-2xl border border-red-200">
                             <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                             <h2 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h2>
                             <p className="text-red-700 mb-4">The selfie does not match the uploaded ID. Please try again.</p>
                             <button onClick={() => setStep(3)} className="bg-white border-2 border-red-500 text-red-600 font-bold py-3 px-8 rounded-full transition hover:bg-red-50">
                                Try Again
                             </button>
                         </div>
                    )}
                </div>
            )}

        </div>
    );
}
