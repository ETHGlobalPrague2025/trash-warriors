import { ethers } from 'ethers';
import { ensureFlowTestnet } from './contracts';

const RECYCLING_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS!;

// Update ABI to include all events and structs
const RECYCLING_SYSTEM_ABI = [
    // Structs are represented in function returns
    "function pendingGarbageCans(uint256) external view returns (string location, uint256 totalStaked, uint256 targetAmount, bool deployed, uint256 deployedGarbageCanId)",
    "function garbageCans(uint256) external view returns (uint256 id, string location, uint256 currentValue, bool isActive, bool isLocked, uint256 deploymentTimestamp, uint256 lastEmptiedTimestamp, uint256 totalStaked)",
    "function getStakerShare(uint256 garbageCanId, address staker) external view returns (uint256)",

    // Functions
    "function createPendingGarbageCan(string memory location, uint256 targetAmount) external",
    "function stakeForGarbageCan(uint256 pendingGarbageCanId, uint256 amount) external",
    "function buyContents(uint256 garbageCanId) external",

    // Events
    "event GarbageCanCreated(uint256 indexed id, string location)",
    "event StakeDeposited(uint256 indexed pendingGarbageCanId, address indexed staker, uint256 amount)",
    "event GarbageCanDeployed(uint256 indexed pendingGarbageCanId, uint256 indexed garbageCanId)",
    "event FillLevelUpdated(uint256 indexed garbageCanId, uint8 recyclableType, uint256 amount, uint256 value)",
    "event ContentsPurchased(uint256 indexed garbageCanId, address indexed collector, uint256 value)",
    "event RewardsWithdrawn(address indexed staker, uint256 amount)"
] as const;

export enum RecyclableType {
    PLASTIC,
    METAL,
    OTHER
}

export interface Deposit {
    recyclableType: RecyclableType;
    amount: bigint;
    value: bigint;
    timestamp: number;
}

export interface GarbageCan {
    id: number;
    location: string;
    currentValue: bigint;
    isActive: boolean;
    isLocked: boolean;
    deploymentTimestamp: number;
    lastEmptiedTimestamp: number;
    totalStaked: bigint;
    coordinates?: { lat: number; lng: number };
}

export interface PendingGarbageCan {
    id: number;
    location: string;
    totalStaked: bigint;
    targetAmount: bigint;
    deployed: boolean;
    deployedGarbageCanId: number;
}

// Update event interfaces
interface GarbageCanCreatedEvent extends ethers.EventLog {
    args: [bigint, string] & { id: bigint; location: string };
}

interface GarbageCanDeployedEvent extends ethers.EventLog {
    args: [bigint, bigint] & { pendingGarbageCanId: bigint; garbageCanId: bigint };
}

interface FillLevelUpdatedEvent extends ethers.EventLog {
    args: [bigint, number, bigint, bigint] & {
        garbageCanId: bigint;
        recyclableType: number;
        amount: bigint;
        value: bigint;
    };
}

interface ContentsPurchasedEvent extends ethers.EventLog {
    args: [bigint, string, bigint] & {
        garbageCanId: bigint;
        collector: string;
        value: bigint;
    };
}

// Update getPendingCans function
export async function getPendingCans(): Promise<PendingGarbageCan[]> {
    await ensureFlowTestnet();
    
    if (!window.ethereum) throw new Error('No wallet found');
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const contract = new ethers.Contract(
        RECYCLING_SYSTEM_ADDRESS,
        RECYCLING_SYSTEM_ABI,
        provider
    );

    const filter = contract.filters.GarbageCanCreated();
    const events = await contract.queryFilter(filter) as GarbageCanCreatedEvent[];
    
    const pendingCans: PendingGarbageCan[] = [];
    
    for (const event of events) {
        try {
            const info = await contract.pendingGarbageCans(event.args.id);
            if (!info.deployed) {
                pendingCans.push({
                    id: Number(event.args.id),
                    location: info.location,
                    totalStaked: info.totalStaked,
                    targetAmount: info.targetAmount,
                    deployed: info.deployed,
                    deployedGarbageCanId: Number(info.deployedGarbageCanId)
                });
            }
        } catch (e) {
            console.error('Error fetching pending can:', e);
        }
    }
    
    return pendingCans;
}

// Update getActiveCans function
export async function getActiveCans(): Promise<GarbageCan[]> {
    await ensureFlowTestnet();
    
    if (!window.ethereum) throw new Error('No wallet found');
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const contract = new ethers.Contract(
        RECYCLING_SYSTEM_ADDRESS,
        RECYCLING_SYSTEM_ABI,
        provider
    );

    const filter = contract.filters.GarbageCanDeployed();
    const events = await contract.queryFilter(filter) as GarbageCanDeployedEvent[];
    
    const cans: GarbageCan[] = [];
    
    for (const event of events) {
        try {
            const info = await contract.garbageCans(event.args.garbageCanId);
            if (info.isActive) {
                cans.push({
                    id: Number(event.args.garbageCanId),
                    location: info.location,
                    currentValue: info.currentValue,
                    isActive: info.isActive,
                    isLocked: info.isLocked,
                    deploymentTimestamp: Number(info.deploymentTimestamp),
                    lastEmptiedTimestamp: Number(info.lastEmptiedTimestamp),
                    totalStaked: info.totalStaked,
                    coordinates: { lat: 40.7128, lng: -74.006 } // TODO: Store coordinates properly
                });
            }
        } catch (e) {
            console.error('Error fetching active can:', e);
        }
    }
    
    return cans;
}

// Update getCanHistory function
export async function getCanHistory(canId: number): Promise<{
    fills: Array<{ type: RecyclableType; amount: bigint; value: bigint; timestamp: number }>;
    purchases: Array<{ collector: string; value: bigint; timestamp: number }>;
}> {
    await ensureFlowTestnet();
    
    if (!window.ethereum) throw new Error('No wallet found');
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const contract = new ethers.Contract(
        RECYCLING_SYSTEM_ADDRESS,
        RECYCLING_SYSTEM_ABI,
        provider
    );

    const fillFilter = contract.filters.FillLevelUpdated(canId);
    const fillEvents = await contract.queryFilter(fillFilter) as FillLevelUpdatedEvent[];
    
    const purchaseFilter = contract.filters.ContentsPurchased(canId);
    const purchaseEvents = await contract.queryFilter(purchaseFilter) as ContentsPurchasedEvent[];

    const fills = await Promise.all(fillEvents.map(async (e) => {
        const block = await e.getBlock();
        return {
            type: e.args.recyclableType as RecyclableType,
            amount: e.args.amount,
            value: e.args.value,
            timestamp: Number(block.timestamp)
        };
    }));

    const purchases = await Promise.all(purchaseEvents.map(async (e) => {
        const block = await e.getBlock();
        return {
            collector: e.args.collector,
            value: e.args.value,
            timestamp: Number(block.timestamp)
        };
    }));

    return { fills, purchases };
}

export async function createCan(location: string, targetAmount: number) {
    await ensureFlowTestnet();

    if (!window.ethereum) throw new Error('No wallet found');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
        RECYCLING_SYSTEM_ADDRESS,
        RECYCLING_SYSTEM_ABI,
        signer
    );

    const tx = await contract.createPendingGarbageCan(
        location,
        ethers.parseUnits(targetAmount.toString(), 6)
    );
    await tx.wait();
}

export async function stakeCan(canId: number, amount: number) {
    await ensureFlowTestnet();

    if (!window.ethereum) throw new Error('No wallet found');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
        RECYCLING_SYSTEM_ADDRESS,
        RECYCLING_SYSTEM_ABI,
        signer
    );

    const tx = await contract.stakeForGarbageCan(
        canId,
        ethers.parseUnits(amount.toString(), 6)
    );
    await tx.wait();
}

export async function purchaseContents(canId: number) {
    await ensureFlowTestnet();

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
        RECYCLING_SYSTEM_ADDRESS,
        RECYCLING_SYSTEM_ABI,
        signer
    );

    const tx = await contract.buyContents(canId);
    await tx.wait();
} 