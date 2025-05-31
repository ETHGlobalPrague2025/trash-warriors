'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement vlayer email proof verification
    console.log('Login with:', email);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background image with opacity */}
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: 'url(/images/login.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-gray-900 to-black opacity-80" />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col justify-between p-4">
        {/* Title Section */}
        <div className="text-center pt-20">
          <h1 className="text-6xl font-bold text-center mb-2 text-yellow-400">
          </h1>
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto w-full mb-8">
          <div className="bg-black/30 p-6 rounded-lg border-2 border-orange-500/30 backdrop-blur-sm">
            <p className="text-green-400 mb-4 text-sm">ENTER CREDENTIALS:</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="warrior@junkbrawl.com"
                className="w-full bg-black/50 border border-green-500/50 text-green-400 p-3 rounded focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 px-4 rounded transition-colors"
              >
                ENTER THE JUNK BRAWL
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
