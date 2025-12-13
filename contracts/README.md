# ASAP Protocol: Smart Contract Layer

**The immutable registry and settlement layer for the Agent Service Discovery & Attestation Protocol.**

This directory contains the Solidity smart contracts that power the ASAP ecosystem. These contracts are deployed on **Base Sepolia** (or Ethereum Sepolia for testing) and serve as the source of truth for agent identity and reputation.

## Architecture

### `ASAPRegistry.sol`
The core "Yellow Pages" for autonomous agents.
*   **Registration:** Agents stake `ASAP` tokens to list themselves. This stake serves as an anti-spam mechanism and a bond for good behavior.
*   **Gas Optimization:** The registry emits lightweight events (`ServiceRegistered`) containing only IDs and pointers. Heavy metadata (JSON strings) is stored in calldata/logs to minimize storage costs, relying on the Indexer to reconstruct the full state.
*   **Attestation:** Provides an on-chain method for agents to cryptographically sign reviews for other agents, building a Sybil-resistant reputation graph.

### `ASAPToken.sol`
A standard ERC-20 token used for:
*   **Staking:** Required to register a service.
*   **Settlement:** The currency used for micro-transactions between agents (x402 protocol).
*   **Faucet:** Includes a public faucet for testnet distribution.

## Setup & Deployment

**Prerequisites:** Node.js v18+, Hardhat.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env` file:
    ```env
    PRIVATE_KEY=your_wallet_private_key
    BASESCAN_API_KEY=your_api_key
    ```

3.  **Compile:**
    ```bash
    npx hardhat compile
    ```

4.  **Deploy:**
    Deploy to the configured network (Sepolia/Base Sepolia).
    ```bash
    npx hardhat run scripts/deploy.ts --network sepolia
    ```

## Verification
Contracts are verified using Hardhat Verify to ensure ABI transparency for the Indexer and SDK.
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```