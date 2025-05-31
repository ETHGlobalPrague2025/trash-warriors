'use client';

import Map from '@/components/Map';
import { useRouter } from 'next/navigation';

// Mock quest data
const MOCK_QUEST = {
  id: 1,
  title: "Clean Street Warriors",
  description: "Clear 3 overflowing bins in the Downtown district",
  reward: {
    xp: 250,
    tokens: 100
  },
  progress: {
    current: 1,
    total: 3
  },
  timeLeft: "2h 30m",
  difficulty: "MEDIUM",
  status: "IN_PROGRESS"
};

export default function QuestPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: 'url(/images/street.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 z-10 bg-black/40" />

      {/* Content */}
      <div className="relative z-20 min-h-screen p-4">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="mb-4 text-green-400 hover:text-green-300"
        >
          ← Back to Quests
        </button>

        {/* Quest Info Card */}
        <div className="max-w-md mx-auto bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm mb-4">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl text-yellow-400 font-bold">{MOCK_QUEST.title}</h1>
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-sm rounded">
              {MOCK_QUEST.difficulty}
            </span>
          </div>

          <p className="text-gray-300 mb-4">{MOCK_QUEST.description}</p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">Progress</span>
              <span className="text-gray-400">
                {MOCK_QUEST.progress.current}/{MOCK_QUEST.progress.total}
              </span>
            </div>
            <div className="bg-gray-800/50 rounded-full h-2">
              <div 
                className="bg-green-500 h-full rounded-full"
                style={{ 
                  width: `${(MOCK_QUEST.progress.current / MOCK_QUEST.progress.total) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Rewards and Time */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Rewards</div>
              <div className="flex gap-3">
                <div className="text-yellow-400">
                  {MOCK_QUEST.reward.tokens} 🪙
                </div>
                <div className="text-green-400">
                  {MOCK_QUEST.reward.xp} XP
                </div>
              </div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Time Left</div>
              <div className="text-orange-400">{MOCK_QUEST.timeLeft}</div>
            </div>
          </div>

          <button className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors">
            ACCEPT QUEST
          </button>
        </div>

        {/* Map Section */}
        <div className="max-w-md mx-auto rounded-lg overflow-hidden">
          <div className="bg-black/50 border-2 border-green-500 rounded-t-lg p-2">
            <h2 className="text-green-400 font-bold">TARGET LOCATIONS</h2>
          </div>
          <Map />
        </div>
      </div>
    </div>
  );
} 