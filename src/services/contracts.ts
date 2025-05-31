import { ethers } from 'ethers';

export const TEST_USDC_ADDRESS = '0xeFaDc14c2DD95D0E6969d0B25EA6e4F830150493';
export const FLOW_TESTNET_CHAIN_ID = '0x221'; // 545 in hex

export const FLOW_TESTNET_PARAMS = {
    chainId: FLOW_TESTNET_CHAIN_ID,
    chainName: 'Flow Testnet',
    nativeCurrency: {
        name: 'Flow',
        symbol: 'FLOW',
        decimals: 18
    },
    rpcUrls: ['https://testnet.flow.com/rpc'],
    blockExplorerUrls: ['https://testnet.flowscan.org']
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

async function ensureFlowTestnet() {
    if (!window.ethereum) throw new Error('No wallet found');

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== FLOW_TESTNET_CHAIN_ID) {
        try {
            // Try to switch to Flow Testnet
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: FLOW_TESTNET_CHAIN_ID }],
            });
        } catch (switchError: any) {
            // If chain hasn't been added to MetaMask, add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [FLOW_TESTNET_PARAMS],
                });
            } else {
                throw switchError;
            }
        }
    }
}

export async function approveUSDC(amount: number) {
    try {
        await ensureFlowTestnet();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const contract = new ethers.Contract(TEST_USDC_ADDRESS, TEST_USDC_ABI, signer);
        
        const tx = await contract.approve(TEST_USDC_ADDRESS, ethers.parseUnits(amount.toString(), 6));
        await tx.wait();
        
        return true;
    } catch (error) {
        console.error('Error approving USDC:', error);
        throw error;
    }
} 