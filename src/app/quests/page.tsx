'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const MOCK_QUESTS = [
    {
        id: 1,
        title: "Clean Street Warriors",
        description: "Clear 3 overflowing bins in the Downtown district",
        reward: { xp: 250, tokens: 100 },
        difficulty: "MEDIUM",
        timeLimit: "2h 30m",
        district: "Downtown",
        type: "Collection"
    },
    {
        id: 2,
        title: "Rapid Response",
        description: "Handle an emergency spillage report",
        reward: { xp: 400, tokens: 150 },
        difficulty: "HARD",
        timeLimit: "1h",
        district: "Industrial",
        type: "Emergency"
    },
    {
        id: 3,
        title: "Eco Patrol",
        description: "Monitor and report bin status in residential area",
        reward: { xp: 150, tokens: 75 },
        difficulty: "EASY",
        timeLimit: "4h",
        district: "Residential",
        type: "Patrol"
    }
];

export default function QuestsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');

    const filteredQuests = MOCK_QUESTS.filter(quest => {
        const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quest.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || quest.type === selectedType;
        return matchesSearch && matchesType;
    });

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
                        <h1 className="text-2xl font-bold text-yellow-400">AVAILABLE QUESTS</h1>
                        <button
                            onClick={() => router.push('/profile')}
                            className="text-green-400 hover:text-green-300"
                        >
                            Profile →
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm mb-6">
                        <input
                            type="text"
                            placeholder="Search quests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-green-500/50 text-green-400 p-3 rounded mb-3 focus:outline-none focus:border-green-500"
                        />

                        <div className="flex gap-2">
                            {['Collection', 'Emergency', 'Patrol'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(selectedType === type ? '' : type)}
                                    className={`px-3 py-1 rounded text-sm ${selectedType === type
                                            ? 'bg-green-500 text-black'
                                            : 'bg-black/30 text-green-400 border border-green-500/30'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quest List */}
                    <div className="space-y-4">
                        {filteredQuests.map(quest => (
                            <div
                                key={quest.id}
                                onClick={() => router.push(`/quests/${quest.id}`)}
                                className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl text-yellow-400 font-bold">{quest.title}</h2>
                                    <span className={`px-2 py-1 text-sm rounded ${quest.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                                            quest.difficulty === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {quest.difficulty}
                                    </span>
                                </div>

                                <p className="text-gray-300 text-sm mb-3">{quest.description}</p>

                                <div className="flex justify-between text-sm">
                                    <div className="flex gap-3">
                                        <span className="text-yellow-400">{quest.reward.tokens} 🪙</span>
                                        <span className="text-green-400">{quest.reward.xp} XP</span>
                                    </div>
                                    <span className="text-orange-400">{quest.timeLimit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 