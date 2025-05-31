'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface PendingCan {
    id: number;
    location: string;
    totalStaked: bigint;
    targetAmount: bigint;
    status: 'pending';
}

interface ActiveCan {
    id: number;
    location: string;
    totalStaked: bigint;
    currentValue: bigint;
    isLocked: boolean;
    deploymentTimestamp: number;
    lastEmptiedTimestamp: number;
    status: 'active';
}

interface PendingCanInfo {
    location: string;
    totalStaked: bigint;
    targetAmount: bigint;
    deployed: boolean;
    deployedGarbageCanId: bigint;
}

type Can = PendingCan | ActiveCan;

const RECYCLING_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS!;

const RECYCLING_SYSTEM_ABI = [
    // View functions for both can types
    "function pendingGarbageCans(uint256) external view returns (string location, uint256 totalStaked, uint256 targetAmount, bool deployed, uint256 deployedGarbageCanId)",
    "function garbageCans(uint256) external view returns (uint256 id, string location, uint256 currentValue, bool isActive, bool isLocked, uint256 deploymentTimestamp, uint256 lastEmptiedTimestamp, uint256 totalStaked)",
    "function nextGarbageCanId() external view returns (uint256)",
    "function nextPendingGarbageCanId() external view returns (uint256)"
] as const;

export default function CansPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
    const [cans, setCans] = useState<Can[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCans();
    }, []);

    const loadCans = async () => {
        try {
            setIsLoading(true);

            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC);
            const contract = new ethers.Contract(
                RECYCLING_SYSTEM_ADDRESS,
                RECYCLING_SYSTEM_ABI,
                provider
            );

            // Get total counts
            const [nextPendingId, nextActiveId] = await Promise.all([
                contract.nextPendingGarbageCanId(),
                contract.nextGarbageCanId()
            ]);

            const pendingList: PendingCan[] = [];
            const activeList: ActiveCan[] = [];

            // Get pending cans
            for (let i = 0; i < Number(nextPendingId); i++) {
                try {
                    const pendingInfo: PendingCanInfo = await contract.pendingGarbageCans(i);
                    if (!pendingInfo.deployed) {
                        pendingList.push({
                            id: i,
                            location: pendingInfo.location,
                            totalStaked: pendingInfo.totalStaked,
                            targetAmount: pendingInfo.targetAmount,
                            status: 'pending'
                        });
                    }
                } catch (e) {
                    console.log(`Error fetching pending can ${i}:`, e);
                }
            }

            // Get active cans
            for (let i = 0; i < Number(nextActiveId); i++) {
                try {
                    const activeInfo = await contract.garbageCans(i);
                    if (activeInfo.isActive) {
                        activeList.push({
                            id: i,
                            location: activeInfo.location,
                            totalStaked: activeInfo.totalStaked,
                            currentValue: activeInfo.currentValue,
                            isLocked: activeInfo.isLocked,
                            deploymentTimestamp: Number(activeInfo.deploymentTimestamp),
                            lastEmptiedTimestamp: Number(activeInfo.lastEmptiedTimestamp),
                            status: 'active'
                        });
                    }
                } catch (e) {
                    console.log(`Error fetching active can ${i}:`, e);
                }
            }

            // Combine both lists
            setCans([...pendingList, ...activeList]);

        } catch (err) {
            console.error('Error loading cans:', err);
            setError(err instanceof Error ? err.message : 'Failed to load cans');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCans = cans.filter(can => {
        if (filter === 'all') return true;
        return can.status === filter;
    });

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
                        <h1 className="text-2xl font-bold text-yellow-400">GARBAGE CANS</h1>
                        <button
                            onClick={() => router.push('/cans/request')}
                            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
                        >
                            REQUEST NEW
                        </button>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded ${filter === 'all'
                                ? 'bg-green-500 text-black'
                                : 'bg-black/50 text-green-400'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded ${filter === 'pending'
                                ? 'bg-green-500 text-black'
                                : 'bg-black/50 text-green-400'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded ${filter === 'active'
                                ? 'bg-green-500 text-black'
                                : 'bg-black/50 text-green-400'
                                }`}
                        >
                            Active
                        </button>
                    </div>

                    {/* Cans List */}
                    {isLoading ? (
                        <div className="text-center text-green-400">Loading cans...</div>
                    ) : error ? (
                        <div className="text-center text-red-400">{error}</div>
                    ) : filteredCans.length === 0 ? (
                        <div className="text-center text-gray-400">No cans found</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCans.map((can) => (
                                <div
                                    key={`${can.status}-${can.id}`}
                                    className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-white font-bold">Can #{can.id}</h2>
                                        <span className={`px-2 py-1 rounded text-xs ${can.status === 'pending'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : can.isLocked
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-green-500/20 text-green-400'
                                            }`}>
                                            {can.status === 'pending'
                                                ? 'PENDING'
                                                : can.isLocked
                                                    ? 'LOCKED'
                                                    : 'ACTIVE'}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 text-sm mb-4">{can.location}</div>

                                    {can.status === 'pending' ? (
                                        // Pending can display
                                        <>
                                            <div className="mb-3">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-green-400">
                                                        {Math.round((Number(can.totalStaked) / Number(can.targetAmount)) * 100)}% Funded
                                                    </span>
                                                    <span className="text-yellow-400">
                                                        {ethers.formatUnits(can.totalStaked, 6)} / {ethers.formatUnits(can.targetAmount!, 6)} USDC
                                                    </span>
                                                </div>
                                                <div className="bg-gray-800/50 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-full rounded-full"
                                                        style={{
                                                            width: `${(Number(can.totalStaked) / Number(can.targetAmount)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/cans/${can.status}/${can.id}`)}
                                                className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded w-full"
                                            >
                                                CONTRIBUTE
                                            </button>
                                        </>
                                    ) : (
                                        // Active can display
                                        <>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <div className="text-gray-400 text-xs">Current Value</div>
                                                    <div className="text-yellow-400">
                                                        {ethers.formatUnits(can.currentValue!, 6)} USDC
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 text-xs">Total Staked</div>
                                                    <div className="text-yellow-400">
                                                        {ethers.formatUnits(can.totalStaked, 6)} USDC
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/collector?canId=${can.id}`)}
                                                disabled={can.isLocked}
                                                className={`w-full font-bold py-2 px-4 rounded ${can.isLocked
                                                    ? 'bg-gray-500 cursor-not-allowed'
                                                    : 'bg-green-500 hover:bg-green-600'
                                                    } text-black`}
                                            >
                                                {can.isLocked ? 'LOCKED' : 'COLLECT'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 