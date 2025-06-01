'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
    const router = useRouter();
    const [fileContent, setFileContent] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: fileContent,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Verification failed.");
            }

            setSuccess("Email verified successfully!");
            // Store verification result
            localStorage.setItem('emailVerified', 'true');
            localStorage.setItem('verificationProof', JSON.stringify(result));

            // Redirect to quests after short delay
            setTimeout(() => router.push('/quests'), 2000);
        } catch (err) {
            console.error("Error:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
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
                <div className="max-w-md mx-auto pt-20">
                    <h1 className="text-2xl font-bold text-yellow-400 mb-2 text-center">
                        VERIFY YOUR EMAIL
                    </h1>
                    <p className="text-green-400 text-center mb-8">
                        Upload your .eml file to verify your email address
                    </p>

                    <div className="bg-black/50 border-2 border-green-500 rounded-lg p-6 backdrop-blur-sm">
                        {/* File Upload Area */}
                        <div className="mb-6">
                            <div className="flex justify-center items-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-black/30 hover:bg-black/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="mb-2 text-sm text-green-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400">.eml files only</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".eml"
                                        onChange={handleFileChange}
                                        disabled={isLoading}
                                    />
                                </label>
                            </div>
                            {fileName && (
                                <p className="mt-2 text-sm text-green-400">
                                    Selected: {fileName}
                                </p>
                            )}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerify}
                            disabled={isLoading || !fileContent}
                            className={`w-full font-bold py-3 px-4 rounded transition-colors ${isLoading || !fileContent
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                                } text-black`}
                        >
                            {isLoading ? 'VERIFYING...' : 'VERIFY EMAIL'}
                        </button>

                        {/* Status Messages */}
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
                </div>
            </div>
        </div>
    );
} 