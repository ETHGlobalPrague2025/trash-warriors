'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SelectLocationMap from '@/components/SelectLocationMap';

const RECYCLING_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS!;

const RECYCLING_SYSTEM_ABI = [
    "function garbageCans(uint256) external view returns (uint256 id, string location, uint256 currentValue, bool isActive, bool isLocked, uint256 deploymentTimestamp, uint256 lastEmptiedTimestamp, uint256 totalStaked)",
    "function buyContents(uint256 garbageCanId) external"
] as const;

export default function ActiveCanPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [canInfo, setCanInfo] = useState<{
        location: string;
        currentValue: bigint;
        totalStaked: bigint;
        isLocked: boolean;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCanInfo();
    }, [params.id]);

    const loadCanInfo = async () => {
        try {
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC);
            const contract = new ethers.Contract(
                RECYCLING_SYSTEM_ADDRESS,
                RECYCLING_SYSTEM_ABI,
                provider
            );

            const info = await contract.garbageCans(params.id);
            setCanInfo({
                location: info.location,
                currentValue: info.currentValue,
                totalStaked: info.totalStaked,
                isLocked: info.isLocked
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load can info');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCollect = async () => {
        setError(null);
        setIsProcessing(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                RECYCLING_SYSTEM_ADDRESS,
                RECYCLING_SYSTEM_ABI,
                signer
            );

            const tx = await contract.buyContents(params.id);
            await tx.wait();

            router.push('/cans');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to collect');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="text-center text-green-400">Loading...</div>;
    if (error) return <div className="text-center text-red-400">{error}</div>;
    if (!canInfo) return <div className="text-center text-red-400">Can not found</div>;

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
                        ← Back to Cans
                    </button>

                    {/* Can Info */}
                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-xl font-bold text-white">Active Can #{params.id}</h1>
                            <span className={`px-2 py-1 rounded text-xs ${
                                canInfo.isLocked
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-green-500/20 text-green-400'
                            }`}>
                                {canInfo.isLocked ? 'LOCKED' : 'AVAILABLE'}
                            </span>
                        </div>
                        <div className="text-gray-400 text-sm mb-4">{canInfo.location}</div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div className="text-gray-400 text-xs">Current Value</div>
                                <div className="text-yellow-400">
                                    {ethers.formatUnits(canInfo.currentValue, 6)} USDC
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs">Total Staked</div>
                                <div className="text-yellow-400">
                                    {ethers.formatUnits(canInfo.totalStaked, 6)} USDC
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCollect}
                            disabled={isProcessing || canInfo.isLocked}
                            className={`w-full font-bold py-3 px-4 rounded ${
                                isProcessing || canInfo.isLocked
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                            } text-black`}
                        >
                            {isProcessing ? 'PROCESSING...' : canInfo.isLocked ? 'LOCKED' : 'COLLECT'}
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