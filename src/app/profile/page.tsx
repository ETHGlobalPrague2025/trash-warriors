'use client';

import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const profile = {
        level: 12,
        rank: 4,
        xp: {
            current: 750,
            next: 1000,
            nextLevel: 13
        },
        stats: {
            quests: 47,
            tokens: 1250,
            bins: 156,
            streak: '7d'
        }
    };

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
                {/* Profile Card */}
                <div className="max-w-md mx-auto bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-green-400 font-bold mb-2">WARRIOR PROFILE</div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-gray-700/50 p-2 rounded backdrop-blur-sm">
                            <div className="w-12 h-12 bg-gray-600/50 rounded flex items-center justify-center text-2xl">
                                🗑️
                            </div>
                            <div className="text-center mt-1 text-yellow-400">{profile.level}</div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-yellow-400 text-xl mb-1">TRASH WARRIOR</h2>
                            <div className="text-green-400 text-sm mb-2">
                                Level {profile.level} • Rank # {profile.rank}
                            </div>

                            {/* XP Bar */}
                            <div className="bg-gray-800/50 rounded-full h-2 mb-1">
                                <div
                                    className="bg-yellow-400 h-full rounded-full"
                                    style={{ width: `${(profile.xp.current / profile.xp.next) * 100}%` }}
                                />
                            </div>
                            <div className="text-sm text-gray-400">
                                XP: {profile.xp.current}/{profile.xp.next} • Next Level: {profile.xp.nextLevel}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <StatBox label="Quests" value={profile.stats.quests} color="text-green-400" />
                        <StatBox label="Tokens" value={profile.stats.tokens} color="text-yellow-400" />
                        <StatBox label="Bins" value={profile.stats.bins} color="text-green-400" />
                        <StatBox label="Streak" value={profile.stats.streak} color="text-red-400" />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                        <button className="bg-green-500 text-black font-bold py-2 px-4 rounded">
                            PROFILE
                        </button>
                        <button 
                            onClick={() => router.push('/quests')}
                            className="bg-orange-500 text-black font-bold py-2 px-4 rounded"
                        >
                            QUESTS
                        </button>
                        <button className="bg-black border border-green-500 text-green-500 font-bold py-2 px-4 rounded">
                            LEADERBOARD
                        </button>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="max-w-md mx-auto mt-6">
                    <h3 className="text-yellow-400 mb-4">🏆 ACHIEVEMENT BADGES</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <AchievementCard
                            icon="🔥"
                            title="First Steps"
                            description="Complete your first quest"
                            completed={true}
                        />
                        <AchievementCard
                            icon="🌱"
                            title="Eco Warrior"
                            description="Clear 50 trash bins"
                            completed={true}
                        />
                        <AchievementCard
                            icon="⚡"
                            title="Speed Demon"
                            description="Complete 5 quests in one day"
                            completed={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div className="bg-black/30 p-2 rounded text-center">
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
        </div>
    );
}

function AchievementCard({ icon, title, description, completed }: {
    icon: string;
    title: string;
    description: string;
    completed: boolean;
}) {
    return (
        <div className="bg-black/30 p-4 rounded border border-green-500/30 relative">
            {completed && (
                <div className="absolute top-2 right-2 text-green-500">✓</div>
            )}
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-green-400 text-sm font-bold mb-1">{title}</div>
            <div className="text-gray-400 text-xs">{description}</div>
        </div>
    );
} 