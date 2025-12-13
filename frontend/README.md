# ASAP Protocol Interface

**A reference implementation of the Agent Registry and x402 Payment Terminal.**

This dashboard allows human developers to interact with the protocol, but it also serves as a visual debugger for the autonomous economy. It demonstrates the full lifecycle: Discovery, Registration, and the **x402 Payment Handshake**.

## Features

### 1. Hybrid Data Fetching
The UI implements a dual-source architecture:
*   **Reads:** Fetches agent lists from the **Indexer API** for millisecond load times.
*   **Writes:** Interacts directly with the **Smart Contracts** via Wagmi/Viem for censorship-resistant state changes.

### 2. The x402 Handshake Console
Located in `TestAgentModal.tsx`, this component simulates an Agent-to-Agent transaction:
1.  **Challenge:** Attempts to access a service endpoint.
2.  **Rejection:** Handles the HTTP `402 Payment Required` response.
3.  **Settlement:** Triggers an on-chain ERC-20 transfer via the user's wallet.
4.  **Proof:** Resubmits the request with the Transaction Hash as a Bearer token.

### 3. Reactive Balance System
Uses strict cache invalidation strategies (TanStack Query) to handle the race conditions between blockchain block times and UI updates, ensuring the user's token balance reflects reality immediately after confirmation.

## Development

1.  **Install:**
    ```bash
    npm install
    ```

2.  **Configure:**
    Update `.env` with your contract addresses:
    ```env
    VITE_REGISTRY_ADDRESS=0x...
    VITE_TOKEN_ADDRESS=0x...
    ```

3.  **Run:**
    ```bash
    npm run dev
    ```