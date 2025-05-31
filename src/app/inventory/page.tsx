'use client';

import { useRouter } from 'next/navigation';

const MOCK_INVENTORY = {
    nfts: [
        {
            id: 1,
            name: "Green Guardian",
            type: "LEGENDARY",
            image: "🛡️",
            description: "Earned for clearing 100 bins",
            acquired: "2024-03-15"
        },
        {
            id: 2,
            name: "Street Sweeper",
            type: "RARE",
            image: "🧹",
            description: "Complete 50 quests in Downtown",
            acquired: "2024-03-10"
        },
        {
            id: 3,
            name: "Early Bird",
            type: "COMMON",
            image: "🌅",
            description: "First quest of the day for 7 days",
            acquired: "2024-03-05"
        }
    ],
    tokens: {
        trash: 1250,
        special: 75
    },
    badges: [
        {
            id: 1,
            name: "Streak Master",
            image: "🔥",
            count: 7
        },
        {
            id: 2,
            name: "Bin Boss",
            image: "🗑️",
            count: 156
        }
    ]
};

export default function InventoryPage() {
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
                        <h1 className="text-2xl font-bold text-yellow-400">INVENTORY</h1>
                        <div className="flex gap-3">
                            <div className="text-yellow-400">
                                {MOCK_INVENTORY.tokens.trash} 🪙
                            </div>
                            <div className="text-purple-400">
                                {MOCK_INVENTORY.tokens.special} ⭐
                            </div>
                        </div>
                    </div>

                    {/* NFT Collection */}
                    <div className="mb-6">
                        <h2 className="text-green-400 font-bold mb-3">NFT COLLECTION</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {MOCK_INVENTORY.nfts.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
                                >
                                    <div className="text-4xl mb-2">{nft.image}</div>
                                    <h3 className="text-white font-bold mb-1">{nft.name}</h3>
                                    <div className={`text-sm mb-2 ${
                                        nft.type === 'LEGENDARY' ? 'text-yellow-400' :
                                        nft.type === 'RARE' ? 'text-purple-400' :
                                        'text-blue-400'
                                    }`}>
                                        {nft.type}
                                    </div>
                                    <p className="text-gray-400 text-sm">{nft.description}</p>
                                    <div className="text-green-400 text-xs mt-2">
                                        Acquired: {nft.acquired}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Badges */}
                    <div>
                        <h2 className="text-green-400 font-bold mb-3">BADGES</h2>
                        <div className="space-y-3">
                            {MOCK_INVENTORY.badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm flex items-center gap-4"
                                >
                                    <div className="text-3xl">{badge.image}</div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold">{badge.name}</h3>
                                        <div className="text-green-400 text-sm">
                                            Count: {badge.count}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <button className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded transition-colors">
                        CONNECT WALLET TO CLAIM NFTs
                    </button>
                </div>
            </div>
        </div>
    );
} 