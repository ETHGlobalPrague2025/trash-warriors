'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Map from '@/components/Map';
import { approveUSDC } from '@/services/contracts';
import { createCan } from '@/services/canService';
import SelectLocationMap from '@/components/SelectLocationMap';

interface StakingTier {
    amount: number;
    benefits: string[];
    color: string;
}

const STAKING_TIERS: StakingTier[] = [
    {
        amount: 1000,
        benefits: [
            "Basic garbage can deployment",
            "Your name on the can",
            "Monthly impact reports"
        ],
        color: "border-green-500"
    },
    {
        amount: 2500,
        benefits: [
            "Smart garbage can with fill sensors",
            "Custom branding on the can",
            "Real-time analytics dashboard",
            "Priority maintenance"
        ],
        color: "border-yellow-400"
    },
    {
        amount: 5000,
        benefits: [
            "Premium smart garbage can",
            "Solar-powered compactor",
            "Custom app integration",
            "VIP status in Trash Warriors",
            "Quarterly sustainability reports"
        ],
        color: "border-purple-400"
    }
];

interface MapLocation {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export default function RequestCanPage() {
    const router = useRouter();
    const [selectedTier, setSelectedTier] = useState<number>(0);
    const [location, setLocation] = useState<MapLocation>({
        address: '',
        coordinates: { lat: 0, lng: 0 }
    });
    const [isStaking, setIsStaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsStaking(true);

        try {
            // First approve USDC spend to the contract
            await approveUSDC(STAKING_TIERS[selectedTier].amount);

            // Create the pending garbage can
            await createCan(
                location.address,
                STAKING_TIERS[selectedTier].amount
            );

            router.push('/cans'); // Redirect to cans overview
        } catch (err) {
            console.error('Error creating can:', err);
            setError(err instanceof Error ? err.message : 'Failed to create staking pool');
        } finally {
            setIsStaking(false);
        }
    };

    const handleLocationSelect = (newLocation: MapLocation) => {
        setLocation(newLocation);
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
                        onClick={() => router.push('/cans')}
                        className="mb-4 text-green-400 hover:text-green-300"
                    >
                        ← Back to Requests
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-yellow-400 mb-2">REQUEST NEW CAN</h1>
                        <p className="text-green-400 text-sm">
                            Help keep your community clean by requesting a new garbage can installation
                        </p>
                    </div>

                    {/* Location Selection */}
                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm mb-6">
                        <h2 className="text-white font-bold mb-3">SELECT LOCATION</h2>
                        <SelectLocationMap onLocationSelect={handleLocationSelect} />
                        <input
                            type="text"
                            placeholder="Selected location will appear here"
                            className="w-full bg-black/50 border border-green-500/50 text-green-400 p-3 rounded mt-4 focus:outline-none focus:border-green-500"
                            value={location.address}
                            readOnly
                        />
                    </div>

                    {/* Staking Tiers */}
                    <div className="space-y-4 mb-6">
                        {STAKING_TIERS.map((tier, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedTier(index)}
                                className={`bg-black/50 border-2 ${tier.color} rounded-lg p-4 backdrop-blur-sm cursor-pointer ${selectedTier === index ? 'border-opacity-100' : 'border-opacity-30'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-white font-bold">
                                        Tier {index + 1}
                                    </div>
                                    <div className="text-yellow-400">
                                        {tier.amount} 🪙
                                    </div>
                                </div>
                                <ul className="space-y-1">
                                    {tier.benefits.map((benefit, i) => (
                                        <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isStaking || !location.address}
                        className={`w-full font-bold py-3 px-4 rounded transition-colors ${isStaking || !location.address
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            } text-black`}
                    >
                        {isStaking ? 'CREATING POOL...' : 'CREATE STAKING POOL'}
                    </button>

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded p-3 text-sm text-blue-400">
                        <strong>Note:</strong> Once the staking pool is created, community members can
                        contribute $TRASH tokens to fund the garbage can installation. The pool will be
                        active for 30 days.
                    </div>
                </div>
            </div>
        </div>
    );
} 