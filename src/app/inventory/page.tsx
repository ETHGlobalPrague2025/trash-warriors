'use client';

import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
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

interface DeviceResponse {
    hash: string;
    timestamp: number;
    deviceId: string;
}

export default function InventoryPage() {
    const router = useRouter();
    const [fileContent, setFileContent] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isDeviceConnecting, setIsDeviceConnecting] = useState(false);
    const [faceVerified, setFaceVerified] = useState(false);

    // Move localStorage checks to useEffect
    useEffect(() => {
        setIsVerified(localStorage.getItem('emailVerified') === 'true');
        setFaceVerified(!!localStorage.getItem('faceHash'));
    }, []);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setFileContent("");
            setFileName("");
            setError(null);
            return;
        }

        setFileName(file.name);
        setError(null);

        try {
            const rawText = await file.text();
            const escapedText = rawText
                .replace(/\\/g, "\\\\")
                .replace(/\r/g, "\\r")
                .replace(/\n/g, "\\n")
                .replace(/\t/g, "\\t");
            setFileContent(escapedText);
        } catch (error) {
            console.error("Error reading file:", error);
            setError("Could not read the file content.");
            setFileContent("");
            setFileName("");
        }
        e.target.value = "";
    };

    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();
        if (!fileContent) {
            setError("Please select a file first.");
            return;
        }

        setIsVerifying(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ZKP_API_URL}/api/zkp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: fileContent,
                }),
            });

            if (response.status === 400) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Verification failed");
            }

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result = await response.json();

            // Store verification result
            localStorage.setItem('emailVerified', 'true');
            localStorage.setItem('verificationProof', JSON.stringify({
                prover: result.prover,
                verifier: result.verifier
            }));

            setSuccess("Email verified successfully! You can now access special quests.");
            setIsVerified(true);
        } catch (err) {
            console.error("Error:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setIsVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const verifyFaceAtDevice = async () => {
        setIsCapturing(true);
        setError(null);
        setSuccess(null);

        try {
            // Use the ngrok endpoint
            const response = await fetch('https://valued-hermit-sadly.ngrok-free.app/face/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to connect to device');
            }

            const result: DeviceResponse = await response.json();

            // Store hash with email verification
            const verificationProof = localStorage.getItem('verificationProof');
            if (verificationProof) {
                const proof = JSON.parse(verificationProof);
                localStorage.setItem('faceHash', result.hash);
                localStorage.setItem('deviceVerification', JSON.stringify({
                    email: proof.email,
                    faceHash: result.hash,
                    deviceId: result.deviceId,
                    timestamp: result.timestamp
                }));
                setFaceVerified(true);
            }

            setSuccess("Face verification successful! You can now collect rewards.");
        } catch (err) {
            console.error("Error:", err);
            setError(err instanceof Error ? err.message : "Face verification failed");
            setFaceVerified(false);
        } finally {
            setIsCapturing(false);
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
                    <h1 className="text-2xl font-bold text-yellow-400 mb-6">INVENTORY</h1>

                    {/* Email Verification Section */}
                    <div className="mb-8 bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-green-400 font-bold">EMAIL VERIFICATION</h2>
                            <div className={`px-2 py-1 rounded text-sm ${isVerified
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </div>
                        </div>

                        {!isVerified && (
                            <>
                                <p className="text-gray-400 text-sm mb-4">
                                    Verify your email to unlock special rewards and quests
                                </p>
                                <div className="mb-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-black/30 hover:bg-black/50">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p className="mb-2 text-sm text-green-400">
                                                <span className="font-semibold">Upload .eml file</span>
                                            </p>
                                            <p className="text-xs text-gray-400">to verify your email</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".eml"
                                            onChange={handleFileChange}
                                            disabled={isVerifying}
                                        />
                                    </label>
                                    {fileName && (
                                        <p className="mt-2 text-sm text-green-400">
                                            Selected: {fileName}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleVerify}
                                    disabled={isVerifying || !fileContent}
                                    className={`w-full font-bold py-2 px-4 rounded ${isVerifying || !fileContent
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                        } text-black`}
                                >
                                    {isVerifying ? 'VERIFYING...' : 'VERIFY EMAIL'}
                                </button>

                                {error && (
                                    <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded p-3 text-sm text-green-400">
                                        {success}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Face Verification Section */}
                    <div className="mb-8 bg-black/50 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-green-400 font-bold">FACE VERIFICATION</h2>
                            <div className={`px-2 py-1 rounded text-sm ${faceVerified
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                {faceVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">
                            Stand in front of the device camera and click verify to complete face verification
                        </p>

                        <button
                            onClick={verifyFaceAtDevice}
                            disabled={isCapturing}
                            className={`w-full font-bold py-2 px-4 rounded ${isCapturing
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                                } text-black`}
                        >
                            {isCapturing ? 'VERIFYING...' : 'VERIFY AT DEVICE'}
                        </button>

                        {error && (
                            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded p-3 text-sm text-green-400">
                                {success}
                            </div>
                        )}
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
                                    <div className={`text-sm mb-2 ${nft.type === 'LEGENDARY' ? 'text-yellow-400' :
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