export const REGISTRY_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "_farcasterId", "type": "uint256" },
            { "internalType": "string", "name": "_endpointUrl", "type": "string" },
            { "internalType": "string", "name": "_metadata", "type": "string" },
            { "internalType": "uint256", "name": "_stakeAmount", "type": "uint256" }
        ],
        "name": "registerService",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
        "name": "getService",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "address", "name": "provider", "type": "address" },
                    { "internalType": "uint256", "name": "farcasterId", "type": "uint256" },
                    { "internalType": "string", "name": "endpointUrl", "type": "string" },
                    { "internalType": "string", "name": "metadata", "type": "string" },
                    { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
                    { "internalType": "uint256", "name": "reputation", "type": "uint256" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" },
                    { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
                ],
                "internalType": "struct ASAPRegistry.Service",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "serviceId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "provider", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "farcasterId", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" }
        ],
        "name": "ServiceRegistered",
        "type": "event"
    }
] as const;

export const TOKEN_ABI = [
    {
        "inputs": [],
        "name": "faucet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // --- NEW ADDITION BELOW ---
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;