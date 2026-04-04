"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      
      {/* Header */}
      <header className="clay-card m-8 mb-4 px-12 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-3xl font-bold font-syne text-gray-800">LoanPouch</h1>
          
          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              About
            </a>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Card - Full Height */}
      <div className="clay-card mx-8 mb-8 flex-1 p-16 clay-glow flex items-center">
        
        <div className="w-full flex items-center justify-between gap-16">
          
          {/* Left Side - Text Content */}
          <div className="flex-1 space-y-6">
            <h2 className="text-7xl font-bold font-syne text-gray-800 leading-tight">
              Ready When<br />You Are
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Get immediate, high-quality support and attention with just one touch. 
              Your lending solution for the future.
            </p>
            
            <div className="flex gap-4 pt-6">
              <Link 
                href="/register" 
                className="px-10 py-4 bg-black text-white rounded-full font-medium text-lg hover:scale-110 hover:bg-gray-800 transition-all"
              >
                Get Started
              </Link>
              <Link 
                href="/login" 
                className="px-10 py-4 bg-black text-white rounded-full font-medium text-lg hover:scale-110 hover:bg-gray-800 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Side - Character */}
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-float relative">
              {/* Decorative dots */}
              <div className="absolute -top-12 -right-12 w-4 h-4 bg-gray-800 rounded-full"></div>
              <div className="absolute top-16 -right-16 w-5 h-5 bg-gray-800 rounded-full"></div>
              <div className="absolute top-40 right-12 w-3 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute -bottom-12 right-20 w-4 h-4 bg-gray-800 rounded-full"></div>
              <div className="absolute top-8 -left-8 w-3 h-3 bg-gray-800 rounded-full"></div>
              
              {/* Character Image */}
              <div className="w-[500px] h-[500px] rounded-3xl overflow-hidden">
                <Image 
                  src="/images/character.jpg" 
                  alt="LoanPouch Character" 
                  width={500} 
                  height={500}
                  className="object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
