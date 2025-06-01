'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SelectLocationMap from '@/components/SelectLocationMap';

const RECYCLING_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS!;

const RECYCLING_SYSTEM_ABI = [
    "function garbageCans(uint256) external view returns (uint256 id, string location, uint256 currentValue, bool isActive, bool isLocked, uint256 deploymentTimestamp, uint256 lastEmptiedTimestamp, uint256 totalStaked)",
    "function buyContents(uint256 garbageCanId) external",
    "function nextGarbageCanId() external view returns (uint256)"
] as const;

interface ActiveCan {
    id: number;
    location: string;
    currentValue: bigint;
    purchaseValue: bigint;
    isActive: boolean;
    isLocked: boolean;
    deploymentTimestamp: number;
    lastEmptiedTimestamp: number;
    totalStaked: bigint;
    coordinates?: { lat: number; lng: number; };
}

export default function CollectorPage() {
    const router = useRouter();
    const [activeCans, setActiveCans] = useState<ActiveCan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [platformFee, setPlatformFee] = useState<number>(50); // Default 50%

    useEffect(() => {
        loadActiveCans();
    }, []);

    const loadActiveCans = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC);
            const contract = new ethers.Contract(
                RECYCLING_SYSTEM_ADDRESS,
                RECYCLING_SYSTEM_ABI,
                provider
            );

            // Get total count
            const nextId = await contract.nextGarbageCanId();
            const cans: ActiveCan[] = [];

            // Get active cans
            for (let i = 0; i < Number(nextId); i++) {
                try {
                    const canInfo = await contract.garbageCans(i);
                    if (canInfo.isActive) {
                        // Calculate purchase value with platform fee
                        const purchaseValue = (canInfo.currentValue * BigInt(150)) / BigInt(100); // 50% fee

                        cans.push({
                            id: i,
                            location: canInfo.location,
                            currentValue: canInfo.currentValue,
                            purchaseValue,
                            isActive: canInfo.isActive,
                            isLocked: canInfo.isLocked,
                            deploymentTimestamp: Number(canInfo.deploymentTimestamp),
                            lastEmptiedTimestamp: Number(canInfo.lastEmptiedTimestamp),
                            totalStaked: canInfo.totalStaked
                        });
                    }
                } catch (e) {
                    console.log(`Error fetching can ${i}:`, e);
                }
            }

            setActiveCans(cans);
        } catch (err) {
            console.error('Error loading cans:', err);
            setError(err instanceof Error ? err.message : 'Failed to load cans');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async (canId: number) => {
        if (!window.ethereum) throw new Error('No wallet found');
        setError(null);
        setIsPurchasing(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                RECYCLING_SYSTEM_ADDRESS,
                RECYCLING_SYSTEM_ABI,
                signer
            );

            const tx = await contract.buyContents(canId);
            await tx.wait();

            // Reload cans after purchase
            await loadActiveCans();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to purchase contents');
        } finally {
            setIsPurchasing(false);
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
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-yellow-400">COLLECTOR DASHBOARD</h1>
                        <div className="text-sm text-green-400">
                            Platform Fee: {platformFee/100}%
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center text-green-400">Loading cans...</div>
                    ) : activeCans.length === 0 ? (
                        <div className="text-center text-gray-400">No active cans available</div>
                    ) : (
                        <div className="space-y-4">
                            {activeCans.map((can) => (
                                <div
                                    key={can.id}
                                    className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
                                >
                                    <div className="mb-4">
                                        <h2 className="text-white font-bold mb-2">Can #{can.id}</h2>
                                        <div className="text-gray-400 text-sm mb-2">{can.location}</div>
                                        
                                        {/* Map */}
                                        <div className="h-[150px] rounded overflow-hidden mb-4">
                                            <SelectLocationMap
                                                onLocationSelect={() => {}}
                                                initialLocation={can.coordinates}
                                                readOnly
                                            />
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-black/30 p-3 rounded">
                                                <div className="text-xs text-gray-400">Contents Value</div>
                                                <div className="text-yellow-400 font-bold">
                                                    {ethers.formatUnits(can.currentValue, 6)} USDC
                                                </div>
                                            </div>
                                            <div className="bg-black/30 p-3 rounded">
                                                <div className="text-xs text-gray-400">Purchase Price</div>
                                                <div className="text-orange-400 font-bold">
                                                    {ethers.formatUnits(can.purchaseValue, 6)} USDC
                                                </div>
                                            </div>
                                            <div className="bg-black/30 p-3 rounded">
                                                <div className="text-xs text-gray-400">Last Emptied</div>
                                                <div className="text-green-400">
                                                    {new Date(Number(can.lastEmptiedTimestamp) * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="bg-black/30 p-3 rounded">
                                                <div className="text-xs text-gray-400">Total Staked</div>
                                                <div className="text-blue-400">
                                                    {ethers.formatUnits(can.totalStaked, 6)} USDC
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purchase Button */}
                                        <button
                                            onClick={() => handlePurchase(can.id)}
                                            disabled={isPurchasing}
                                            className={`w-full font-bold py-3 px-4 rounded transition-colors ${
                                                isPurchasing
                                                    ? 'bg-gray-500 cursor-not-allowed'
                                                    : 'bg-green-500 hover:bg-green-600'
                                            } text-black`}
                                        >
                                            {isPurchasing ? 'PURCHASING...' : `PURCHASE FOR ${ethers.formatUnits(can.purchaseValue, 6)} USDC`}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 