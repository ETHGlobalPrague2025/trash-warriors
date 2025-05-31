'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { approveUSDC } from '@/services/contracts';
import SelectLocationMap from '@/components/SelectLocationMap';

// Mock data - replace with contract call
const MOCK_REQUEST = {
    id: 1,
    location: "123 Main St, Downtown",
    coordinates: { lat: 40.7128, lng: -74.006 },
    targetAmount: 1000,
    currentAmount: 450,
    tier: 1,
    backers: 5,
    daysLeft: 25,
    creator: "0x1234...5678",
    description: "High-traffic area near the shopping district. This location currently lacks proper waste management infrastructure.",
    benefits: [
        "Basic garbage can deployment",
        "Your name on the can",
        "Monthly impact reports"
    ]
};

export default function ContributePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [contribution, setContribution] = useState<number>(0);
    const [isStaking, setIsStaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleContribute = async () => {
        if (!contribution) return;
        
        setError(null);
        setIsStaking(true);

        try {
            // First approve the USDC spend
            await approveUSDC(contribution);

            // TODO: Call contract to stake tokens
            console.log('Contributing to can:', {
                canId: params.id,
                amount: contribution
            });

            router.push('/cans');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to contribute');
        } finally {
            setIsStaking(false);
        }
    };

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
                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="mb-4 text-green-400 hover:text-green-300"
                    >
                        ← Back to Requests
                    </button>

                    {/* Location and Map */}
                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm mb-6">
                        <h1 className="text-xl font-bold text-white mb-2">{MOCK_REQUEST.location}</h1>
                        <div className="text-gray-400 text-sm mb-4">{MOCK_REQUEST.description}</div>
                        <div className="h-[200px] rounded overflow-hidden mb-4">
                            <SelectLocationMap 
                                onLocationSelect={() => {}} 
                                initialLocation={MOCK_REQUEST.coordinates}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Progress and Stats */}
                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-orange-400">{MOCK_REQUEST.daysLeft}d left</div>
                            <div className="text-gray-400">{MOCK_REQUEST.backers} backers</div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-green-400">
                                    {Math.round((MOCK_REQUEST.currentAmount / MOCK_REQUEST.targetAmount) * 100)}% Funded
                                </span>
                                <span className="text-yellow-400">
                                    {MOCK_REQUEST.currentAmount} / {MOCK_REQUEST.targetAmount} 🪙
                                </span>
                            </div>
                            <div className="bg-gray-800/50 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-full rounded-full"
                                    style={{
                                        width: `${(MOCK_REQUEST.currentAmount / MOCK_REQUEST.targetAmount) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="mb-6">
                            <h3 className="text-green-400 font-bold mb-2">BENEFITS</h3>
                            <ul className="space-y-1">
                                {MOCK_REQUEST.benefits.map((benefit, i) => (
                                    <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contribution Input */}
                        <div className="mb-4">
                            <label className="block text-green-400 text-sm font-bold mb-2">
                                YOUR CONTRIBUTION
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={contribution}
                                    onChange={(e) => setContribution(Math.max(0, Number(e.target.value)))}
                                    className="flex-1 bg-black/50 border border-green-500/50 text-green-400 p-3 rounded focus:outline-none focus:border-green-500"
                                    placeholder="Amount in USDC"
                                />
                                <button
                                    onClick={() => setContribution(MOCK_REQUEST.targetAmount - MOCK_REQUEST.currentAmount)}
                                    className="bg-green-500/20 text-green-400 px-3 rounded hover:bg-green-500/30"
                                >
                                    MAX
                                </button>
                            </div>
                        </div>

                        {/* Contribute Button */}
                        <button
                            onClick={handleContribute}
                            disabled={isStaking || !contribution}
                            className={`w-full font-bold py-3 px-4 rounded transition-colors ${
                                isStaking || !contribution
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                            } text-black`}
                        >
                            {isStaking ? 'CONTRIBUTING...' : 'CONTRIBUTE'}
                        </button>

                        {error && (
                            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 