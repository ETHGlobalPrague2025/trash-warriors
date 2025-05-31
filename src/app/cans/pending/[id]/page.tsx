'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { approveUSDC } from '@/services/contracts';
import SelectLocationMap from '@/components/SelectLocationMap';

const RECYCLING_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS!;

const RECYCLING_SYSTEM_ABI = [
    "function pendingGarbageCans(uint256) external view returns (string location, uint256 totalStaked, uint256 targetAmount, bool deployed, uint256 deployedGarbageCanId)",
    "function stakeForGarbageCan(uint256 pendingGarbageCanId, uint256 amount) external"
] as const;

const TEST_USDC_ADDRESS = process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS!;

const TEST_USDC_ABI = [
    "function mint(uint256 amount) external",
    "function approve(address spender, uint256 amount) external returns (bool)"
] as const;

export default function PendingCanPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [canInfo, setCanInfo] = useState<{
        location: string;
        totalStaked: bigint;
        targetAmount: bigint;
    } | null>(null);
    const [contribution, setContribution] = useState<number>(0);
    const [isStaking, setIsStaking] = useState(false);
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

            const info = await contract.pendingGarbageCans(params.id);
            setCanInfo({
                location: info.location,
                totalStaked: info.totalStaked,
                targetAmount: info.targetAmount
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load can info');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContribute = async () => {
        if (!contribution) return;
        setError(null);
        setIsStaking(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();

            // First mint some test USDC
            const usdcContract = new ethers.Contract(
                TEST_USDC_ADDRESS,
                TEST_USDC_ABI,
                signer
            );

            const amount = ethers.parseUnits(contribution.toString(), 6);

            // Mint USDC
            const mintTx = await usdcContract.mint(amount);
            await mintTx.wait();

            // Then approve spending
            await approveUSDC(contribution);

            // Finally stake
            const contract = new ethers.Contract(
                RECYCLING_SYSTEM_ADDRESS,
                RECYCLING_SYSTEM_ABI,
                signer
            );

            const stakeTx = await contract.stakeForGarbageCan(
                params.id,
                amount
            );
            await stakeTx.wait();

            router.push('/cans');
        } catch (err) {
            console.error('Contribution error:', err);
            setError(err instanceof Error ? err.message : 'Failed to contribute');
        } finally {
            setIsStaking(false);
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
                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm mb-6">
                        <h1 className="text-xl font-bold text-white mb-2">Pending Can #{params.id}</h1>
                        <div className="text-gray-400 text-sm mb-4">{canInfo.location}</div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-green-400">
                                    {Math.round((Number(canInfo.totalStaked) / Number(canInfo.targetAmount)) * 100)}% Funded
                                </span>
                                <span className="text-yellow-400">
                                    {ethers.formatUnits(canInfo.totalStaked, 6)} / {ethers.formatUnits(canInfo.targetAmount, 6)} USDC
                                </span>
                            </div>
                            <div className="bg-gray-800/50 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-full rounded-full"
                                    style={{
                                        width: `${(Number(canInfo.totalStaked) / Number(canInfo.targetAmount)) * 100}%`
                                    }}
                                />
                            </div>
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
                                    onClick={() => setContribution(Number(ethers.formatUnits(canInfo.targetAmount - canInfo.totalStaked, 6)))}
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
                            className={`w-full font-bold py-3 px-4 rounded transition-colors ${isStaking || !contribution
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