'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement vlayer email proof verification
    console.log('Login with:', email);
    router.push('/quests');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-md mx-auto pt-20">
        <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">
          TRASH WARRIORS
        </h1>
        <h2 className="text-xl text-orange-500 text-center mb-12">
          STREET RAGE
        </h2>
        
        <div className="bg-black/30 p-6 rounded-lg border-2 border-orange-500/30">
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
  );
} 