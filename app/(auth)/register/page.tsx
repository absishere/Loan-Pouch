"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-syne mb-2">Get Started</h1>
          <p className="text-gray-600">Complete KYC verification to create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`w-12 h-0.5 ${s < step ? "bg-black" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Aadhaar Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Aadhaar Card</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">PAN Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload PAN Card</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Mobile Verification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Face Verification</h2>
              <div className="space-y-4">
                <div className="border-2 border-gray-300 rounded-xl p-12 text-center">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full mb-4" />
                  <p className="text-gray-600">Click to capture selfie</p>
                </div>
                <button
                  onClick={() => setStep(5)}
                  className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Capture & Verify
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-6">Set Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">mPIN (Login)</label>
                  <input
                    type="password"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter 6-digit mPIN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">tPIN (Transactions)</label>
                  <input
                    type="password"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter 6-digit tPIN"
                  />
                </div>
                <Link
                  href="/dashboard"
                  className="block w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors text-center"
                >
                  Complete Registration
                </Link>
              </div>
            </div>
          )}

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-4 text-gray-600 hover:text-black text-sm"
            >
              ← Back
            </button>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
