import { ethers } from 'ethers';

// Contract addresses from environment variables
export const RECYCLING_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS!;
export const TEST_USDC_ADDRESS = process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS!;
export const TRASH_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TRASH_TOKEN_ADDRESS!;
export const TRASH_NFT_ADDRESS = process.env.NEXT_PUBLIC_TRASH_NFT_ADDRESS!;
export const QUEST_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_QUEST_SYSTEM_ADDRESS!;

// Network configuration
export const FLOW_TESTNET_CHAIN_ID = process.env.NEXT_PUBLIC_FLOW_TESTNET_CHAIN_ID!;
export const FLOW_TESTNET_RPC = process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC!;

// Validate environment variables
if (!RECYCLING_SYSTEM_ADDRESS || !TEST_USDC_ADDRESS || !FLOW_TESTNET_CHAIN_ID || !FLOW_TESTNET_RPC) {
    throw new Error('Missing required environment variables');
}

export const FLOW_TESTNET_PARAMS = {
    chainId: FLOW_TESTNET_CHAIN_ID,
    chainName: 'Flow EVM Testnet',
    nativeCurrency: {
        name: 'Flow',
        symbol: 'FLOW',
        decimals: 18
    },
    rpcUrls: [FLOW_TESTNET_RPC],
    blockExplorerUrls: ['https://evm-testnet.flowscan.org']
};

export const TEST_USDC_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",

    "function mint(uint256 amount) external",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",

    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export async function ensureFlowTestnet() {
    if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature');
    }

    try {
        // Request chain switch
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: FLOW_TESTNET_CHAIN_ID }],
        });
    } catch (switchError: any) {
        // Chain hasn't been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [FLOW_TESTNET_PARAMS],
                });
            } catch (addError) {
                throw new Error('Failed to add Flow Testnet to MetaMask');
            }
        } else {
            throw new Error('Failed to switch to Flow Testnet');
        }
    }
}

// Add window.ethereum type
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on: (event: string, callback: (params: any) => void) => void;
            removeListener: (event: string, callback: (params: any) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

export async function approveUSDC(amount: number) {
    try {
        await ensureFlowTestnet();

        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();

        const usdcContract = new ethers.Contract(TEST_USDC_ADDRESS, TEST_USDC_ABI, signer);

        // Approve USDC spend to the RecyclingSystem contract
        const tx = await usdcContract.approve(
            RECYCLING_SYSTEM_ADDRESS, // Approve spend to the RecyclingSystem contract
            ethers.parseUnits(amount.toString(), 6)
        );
        await tx.wait();

        return true;
    } catch (error) {
        console.error('Error approving USDC:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to approve USDC');
    }
} 