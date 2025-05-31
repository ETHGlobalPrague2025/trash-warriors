'use client';

import { useRouter } from 'next/navigation';

const MOCK_LEADERBOARD = [
    {
        rank: 1,
        name: "EcoWarrior_99",
        level: 24,
        xp: 12500,
        tokens: 3200,
        streak: "14d"
    },
    {
        rank: 2,
        name: "TrashPanda",
        level: 22,
        xp: 11200,
        tokens: 2800,
        streak: "10d"
    },
    {
        rank: 3,
        name: "GreenKnight",
        level: 21,
        xp: 10800,
        tokens: 2600,
        streak: "8d"
    },
    // Add more mock data...
    {
        rank: 4,
        name: "BinMaster",
        level: 19,
        xp: 9500,
        tokens: 2400,
        streak: "5d"
    },
    {
        rank: 5,
        name: "RecycleKing",
        level: 18,
        xp: 9000,
        tokens: 2200,
        streak: "4d"
    }
];

export default function LeaderboardPage() {
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
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-yellow-400">LEADERBOARD</h1>
                        <div className="text-green-400 text-sm">Season 1</div>
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-3">
                        {MOCK_LEADERBOARD.map((player) => (
                            <div
                                key={player.rank}
                                className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <div className={`text-2xl font-bold ${player.rank === 1 ? 'text-yellow-400' :
                                            player.rank === 2 ? 'text-gray-400' :
                                                player.rank === 3 ? 'text-orange-400' :
                                                    'text-green-400'
                                        }`}>
                                        #{player.rank}
                                    </div>

                                    {/* Player Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h2 className="text-white font-bold">{player.name}</h2>
                                                <div className="text-green-400 text-sm">
                                                    Level {player.level}
                                                </div>
                                            </div>
                                            <div className="text-orange-400 text-sm">
                                                {player.streak} streak
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-4 text-sm">
                                            <div className="text-yellow-400">
                                                {player.tokens} 🪙
                                            </div>
                                            <div className="text-green-400">
                                                {player.xp} XP
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Your Rank */}
                    <div className="mt-6 bg-green-500/20 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-green-400 text-sm mb-2">YOUR RANK</div>
                        <div className="text-2xl font-bold text-white">#47</div>
                        <div className="text-gray-400 text-sm">Top 15%</div>
                    </div>
                </div>
            </div>
        </div>
    );
} 