import React from 'react';
import KYCVerification from './components/KYCVerification';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased selection:bg-purple-200">
      <div className="w-full">
        {/* Simple Navbar for the prototype */}
        <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold tracking-tight">B</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 tracking-tight">BioLend</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mt-16">
          <KYCVerification />
        </main>
        
      </div>
    </div>
  );
}

export default App;
