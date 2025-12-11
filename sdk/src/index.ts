import { createPublicClient, createWalletClient, http, custom, parseAbi, type PublicClient, type WalletClient, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

// --- ABI Definitions (Minimal) ---
const REGISTRY_ABI = parseAbi([
    'function getService(uint256 _id) view returns ((uint256 id, address provider, uint256 farcasterId, string endpointUrl, string metadata, uint256 stakeAmount, uint256 reputation, bool isActive, uint256 createdAt))',
    'function registerService(uint256 _farcasterId, string _endpointUrl, string _metadata, uint256 _stakeAmount)',
    'function attest(uint256 _serviceId, uint8 _rating, string _reviewCid)',
    'event ServiceRegistered(uint256 indexed serviceId, address indexed provider, uint256 farcasterId, string endpoint)',
    'event AttestationReceived(uint256 indexed serviceId, address indexed attester, uint8 rating, string reviewCid)'
]);

const ERC20_ABI = parseAbi([
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)'
]);

export type ServiceData = {
    id: number;
    provider: Address;
    farcasterId: number;
    endpointUrl: string;
    metadata: any;
    stakeAmount: bigint;
    reputation: number;
    isActive: boolean;
};

export class ASAPSDK {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    registryAddress: Address;

    constructor(registryAddress: Address, rpcUrl?: string, walletClient?: WalletClient) {
        this.registryAddress = registryAddress;
        this.walletClient = walletClient;

        this.publicClient = createPublicClient({
            chain: baseSepolia,
            transport: rpcUrl ? http(rpcUrl) : http()
        });
    }

    /**
     * Discover services by filtering onchain events (The "Yellow Pages" lookup)
     */
    async discover(): Promise<ServiceData[]> {
        // In a real production indexer, we would query an API.
        // For this testnet MVP, we fetch live from chain to demonstrate "no-database" viability.
        const logs = await this.publicClient.getContractEvents({
            address: this.registryAddress,
            abi: REGISTRY_ABI,
            eventName: 'ServiceRegistered',
            fromBlock: 'earliest'
        });

        const services: ServiceData[] = [];

        // Fetch latest state for each registered service
        for (const log of logs) {
            const serviceId = log.args.serviceId!;
            try {
                const data = await this.publicClient.readContract({
                    address: this.registryAddress,
                    abi: REGISTRY_ABI,
                    functionName: 'getService',
                    args: [serviceId]
                });

                if (data.isActive) {
                    services.push({
                        id: Number(data.id),
                        provider: data.provider,
                        farcasterId: Number(data.farcasterId),
                        endpointUrl: data.endpointUrl,
                        metadata: JSON.parse(data.metadata),
                        stakeAmount: data.stakeAmount,
                        reputation: Number(data.reputation),
                        isActive: data.isActive
                    });
                }
            } catch (e) {
                console.warn(`Failed to fetch service ${serviceId}`, e);
            }
        }

        return services;
    }

    /**
     * Verify an x402 endpoint is alive
     */
    async verifyEndpoint(url: string): Promise<boolean> {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
            const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(id);
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    /**
     * Register a new service (Requires Wallet)
     */
    async register(farcasterId: number, url: string, metadata: object, stakeAmount: bigint, tokenAddress: Address) {
        if (!this.walletClient) throw new Error("Wallet required for registration");
        const [account] = await this.walletClient.getAddresses();

        // 1. Approve Token
        const { request: approveReq } = await this.publicClient.simulateContract({
            account,
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [this.registryAddress, stakeAmount]
        });
        const approveHash = await this.walletClient.writeContract(approveReq);
        await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

        // 2. Register
        const { request: regReq } = await this.publicClient.simulateContract({
            account,
            address: this.registryAddress,
            abi: REGISTRY_ABI,
            functionName: 'registerService',
            args: [BigInt(farcasterId), url, JSON.stringify(metadata), stakeAmount]
        });
        return await this.walletClient.writeContract(regReq);
    }
}