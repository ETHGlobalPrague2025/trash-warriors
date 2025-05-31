'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock data - replace with contract calls
const MOCK_REQUESTS = [
    {
        id: 1,
        location: "123 Main St, Downtown",
        coordinates: { lat: 40.7128, lng: -74.006 },
        targetAmount: 1000,
        currentAmount: 450,
        tier: 1,
        backers: 5,
        daysLeft: 25,
        creator: "0x1234...5678"
    },
    {
        id: 2,
        location: "Central Park West",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        targetAmount: 2500,
        currentAmount: 1200,
        tier: 2,
        backers: 8,
        daysLeft: 15,
        creator: "0x8765...4321"
    }
];

export default function CansPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'near' | 'ending'>('all');

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div
                className="absolute inset-0 z-0 opacity-80"
                style={{
                    backgroundImage: 'url(/images/street.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            <div className="fixed inset-0 z-10 bg-black/40" />

            {/* Content */}
            <div className="relative z-20 min-h-screen p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-yellow-400">COMMUNITY CANS</h1>
                        <button
                            onClick={() => router.push('/cans/request')}
                            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors"
                        >
                            + NEW REQUEST
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded text-sm ${
                                filter === 'all'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-black/30 text-green-400 border border-green-500/30'
                            }`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setFilter('near')}
                            className={`px-3 py-1 rounded text-sm ${
                                filter === 'near'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-black/30 text-green-400 border border-green-500/30'
                            }`}
                        >
                            NEAR ME
                        </button>
                        <button
                            onClick={() => setFilter('ending')}
                            className={`px-3 py-1 rounded text-sm ${
                                filter === 'ending'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-black/30 text-green-400 border border-green-500/30'
                            }`}
                        >
                            ENDING SOON
                        </button>
                    </div>

                    {/* Requests List */}
                    <div className="space-y-4">
                        {MOCK_REQUESTS.map((request) => (
                            <div
                                key={request.id}
                                className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h2 className="text-white font-bold mb-1">
                                            {request.location}
                                        </h2>
                                        <div className="text-gray-400 text-sm">
                                            Created by {request.creator}
                                        </div>
                                    </div>
                                    <div className="text-orange-400">
                                        {request.daysLeft}d left
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-green-400">
                                            {Math.round((request.currentAmount / request.targetAmount) * 100)}% Funded
                                        </span>
                                        <span className="text-yellow-400">
                                            {request.currentAmount} / {request.targetAmount} 🪙
                                        </span>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-full rounded-full"
                                            style={{
                                                width: `${(request.currentAmount / request.targetAmount) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <div className="text-gray-400">
                                        {request.backers} backers
                                    </div>
                                    <button
                                        onClick={() => router.push(`/cans/${request.id}`)}
                                        className="bg-green-500 hover:bg-green-600 text-black font-bold py-1 px-3 rounded text-sm transition-colors"
                                    >
                                        CONTRIBUTE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 