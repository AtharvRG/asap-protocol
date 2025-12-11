import { createPublicClient, http, parseAbiItem, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();
app.use(cors());
app.use(express.json());

// YOUR DEPLOYED ADDRESSES
const REGISTRY_ADDRESS = '0xdB921Fea9F25e48E2FA3f60a4D33c0Eabb47C246';

const client = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com')
});

// ABI to read full service details
const READ_ABI = parseAbi([
    'function getService(uint256 _id) view returns ((uint256 id, address provider, uint256 farcasterId, string endpointUrl, string metadata, uint256 stakeAmount, uint256 reputation, bool isActive, uint256 createdAt))'
]);

app.get('/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
});

async function indexEvents() {
    console.log('🔍 Scanning Ethereum Sepolia...');
    try {
        const currentBlock = await client.getBlockNumber();
        const startBlock = currentBlock - 5000n;

        const logs = await client.getLogs({
            address: REGISTRY_ADDRESS as `0x${string}`,
            event: parseAbiItem('event ServiceRegistered(uint256 indexed serviceId, address indexed provider, uint256 farcasterId, string endpoint)'),
            fromBlock: startBlock,
            toBlock: currentBlock
        });

        const insert = db.prepare(`
      INSERT OR REPLACE INTO services (id, provider, farcaster_id, endpoint, metadata, last_checked)
      VALUES (@id, @provider, @fid, @endpoint, @metadata, @block)
    `);

        for (const log of logs) {
            const { serviceId, provider, farcasterId, endpoint } = log.args;

            if (serviceId !== undefined) {
                // FETCH METADATA FROM CONTRACT
                console.log(`⚡ Fetching details for Service #${serviceId}...`);
                try {
                    const serviceData = await client.readContract({
                        address: REGISTRY_ADDRESS as `0x${string}`,
                        abi: READ_ABI,
                        functionName: 'getService',
                        args: [serviceId]
                    });

                    // serviceData.metadata contains the JSON string {"name":"Genesis Agent"}
                    console.log(`✅ Indexed: ${serviceData.metadata}`);

                    insert.run({
                        id: Number(serviceId),
                        provider: provider,
                        fid: Number(farcasterId),
                        endpoint: endpoint,
                        metadata: serviceData.metadata, // <--- SAVING REAL METADATA NOW
                        block: Number(log.blockNumber)
                    });
                } catch (readError) {
                    console.error(`Failed to read service ${serviceId}`, readError);
                }
            }
        }

    } catch (error) {
        console.error("Indexing error:", error);
    }
}

app.listen(3000, () => {
    console.log('🚀 Smart Indexer running on Ethereum Sepolia');
    indexEvents();
    setInterval(indexEvents, 30000);
});