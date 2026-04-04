"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      
      {/* Header */}
      <header className="clay-card m-4 lg:m-8 mb-2 lg:mb-4 px-6 lg:px-12 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-2xl lg:text-3xl font-bold font-syne text-gray-800">LoanPouch</h1>
          
          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Mail Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Card - Responsive Layout */}
      <div className="clay-card mx-4 lg:mx-8 mb-4 lg:mb-8 flex-1 p-6 lg:p-16 clay-glow flex items-center">
        
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          
          {/* Left Side - Text Content */}
          <div className="flex-1 space-y-4 lg:space-y-6 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-syne text-gray-800 leading-tight">
              Ready When<br />You Are
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Get immediate, high-quality support and attention with just one touch. 
              Your lending solution for the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 lg:pt-6 justify-center lg:justify-start">
              <Link 
                href="/register" 
                className="px-8 lg:px-10 py-3 lg:py-4 bg-black text-white rounded-full font-medium text-lg hover:scale-110 hover:bg-gray-800 transition-all"
              >
                Get Started
              </Link>
              <Link 
                href="/login" 
                className="px-8 lg:px-10 py-3 lg:py-4 bg-black text-white rounded-full font-medium text-lg hover:scale-110 hover:bg-gray-800 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Side - Character */}
          <div className="flex-1 flex justify-center items-center order-first lg:order-last">
            <div className="animate-float relative">
              {/* Decorative dots - Fewer on mobile */}
              <div className="absolute -top-8 lg:-top-12 -right-8 lg:-right-12 w-3 lg:w-4 h-3 lg:h-4 bg-gray-800 rounded-full"></div>
              <div className="absolute top-12 lg:top-16 -right-12 lg:-right-16 w-4 lg:w-5 h-4 lg:h-5 bg-gray-800 rounded-full"></div>
              <div className="hidden lg:block absolute top-40 right-12 w-3 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute -bottom-8 lg:-bottom-12 right-16 lg:right-20 w-3 lg:w-4 h-3 lg:h-4 bg-gray-800 rounded-full"></div>
              <div className="hidden lg:block absolute top-8 -left-8 w-3 h-3 bg-gray-800 rounded-full"></div>
              
              {/* Character Image - Responsive Sizes */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] rounded-3xl overflow-hidden">
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
