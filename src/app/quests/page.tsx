'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const QUEST_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_QUEST_SYSTEM_ADDRESS!;

const QUEST_TYPES = {
    FIRST_RECYCLER: 0,    // Recycle anything once
    WEEKLY_WARRIOR: 1,    // Recycle 5 items in a week
    EARTH_CHAMPION: 2,    // Recycle 20 items total
    MATERIAL_MASTER: 3    // Recycle all material types
} as const;

interface Quest {
    type: number;
    name: string;
    description: string;
    requiredAmount: bigint;
    rewardAmount: bigint;
    nftReward: boolean;
    nftURI: string;
    progress?: bigint;
    completed?: boolean;
    claimed?: boolean;
}

const QUEST_SYSTEM_ABI = [
    "function quests(uint8) external view returns (string name, string description, uint256 requiredAmount, uint256 rewardAmount, bool nftReward, string nftURI)",
    "function getQuestStatus(bytes32 emailHash, uint8 questType) external view returns (uint256 progress, uint256 required, bool completed, bool claimed)",
    "function claimRewards(bytes32 emailHash, uint8 questType) external"
] as const;

export default function QuestsPage() {
    const router = useRouter();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        loadQuests();
    }, []);

    const loadQuests = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC);
            const contract = new ethers.Contract(
                QUEST_SYSTEM_ADDRESS,
                QUEST_SYSTEM_ABI,
                provider
            );

            // Get all quest types
            const questPromises = Object.values(QUEST_TYPES).map(async (type) => {
                const questInfo = await contract.quests(type);
                
                // Get user's progress if email is verified
                let progress, completed, claimed;
                try {
                    // TODO: Get email hash from local storage or context
                    const emailHash = ethers.id("user@example.com"); // Replace with actual email hash
                    const status = await contract.getQuestStatus(emailHash, type);
                    progress = status.progress;
                    completed = status.completed;
                    claimed = status.claimed;
                } catch (e) {
                    console.log('Error getting quest status:', e);
                }

                return {
                    type,
                    name: questInfo.name,
                    description: questInfo.description,
                    requiredAmount: questInfo.requiredAmount,
                    rewardAmount: questInfo.rewardAmount,
                    nftReward: questInfo.nftReward,
                    nftURI: questInfo.nftURI,
                    progress,
                    completed,
                    claimed
                };
            });

            const loadedQuests = await Promise.all(questPromises);
            setQuests(loadedQuests);
        } catch (err) {
            console.error('Error loading quests:', err);
            setError(err instanceof Error ? err.message : 'Failed to load quests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaim = async (questType: number) => {
        if (!window.ethereum) throw new Error('No wallet found');
        setError(null);
        setIsClaiming(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                QUEST_SYSTEM_ADDRESS,
                QUEST_SYSTEM_ABI,
                signer
            );

            // TODO: Get email hash from local storage or context
            const emailHash = ethers.id("user@example.com"); // Replace with actual email hash
            const tx = await contract.claimRewards(emailHash, questType);
            await tx.wait();

            // Reload quests after claiming
            await loadQuests();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to claim rewards');
        } finally {
            setIsClaiming(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-yellow-400">QUESTS</h1>
                        <button
                            onClick={() => router.push('/profile')}
                            className="text-green-400 hover:text-green-300"
                        >
                            Profile →
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center text-green-400">Loading quests...</div>
                    ) : error ? (
                        <div className="text-center text-red-400">{error}</div>
                    ) : (
                        <div className="space-y-4">
                            {quests.map((quest) => (
                                <div
                                    key={quest.type}
                                    className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-xl text-yellow-400 font-bold">{quest.name}</h2>
                                        {quest.completed && (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                                                COMPLETED
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-300 text-sm mb-4">{quest.description}</p>

                                    {/* Progress bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-400">Progress</span>
                                            <span className="text-gray-400">
                                                {quest.progress?.toString() || '0'} / {quest.requiredAmount.toString()}
                                            </span>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-full rounded-full"
                                                style={{
                                                    width: `${quest.progress ? (Number(quest.progress) / Number(quest.requiredAmount)) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="flex gap-3 mb-4">
                                        <div className="text-yellow-400">
                                            {ethers.formatUnits(quest.rewardAmount, 18)} 🪙
                                        </div>
                                        {quest.nftReward && (
                                            <div className="text-purple-400">+NFT 🎨</div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleClaim(quest.type)}
                                        disabled={!quest.completed || quest.claimed || isClaiming}
                                        className={`w-full font-bold py-2 px-4 rounded ${
                                            !quest.completed || quest.claimed || isClaiming
                                                ? 'bg-gray-500 cursor-not-allowed'
                                                : 'bg-green-500 hover:bg-green-600'
                                        } text-black`}
                                    >
                                        {quest.claimed 
                                            ? 'CLAIMED' 
                                            : isClaiming 
                                                ? 'CLAIMING...' 
                                                : quest.completed 
                                                    ? 'CLAIM REWARDS' 
                                                    : 'IN PROGRESS'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 