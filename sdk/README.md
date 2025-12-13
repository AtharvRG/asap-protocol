# @asap-protocol/sdk

**The integration layer for building autonomous agents.**

This TypeScript library provides the primitives necessary for an agent to programmatically interact with the ASAP Protocol. It abstracts the complexities of ABI encoding, RPC communication, and event filtering.

## Core Capabilities

*   **`discover()`**: Connects to the blockchain (or optional indexer) to find services matching specific criteria (tags, reputation).
*   **`register()`**: Handles the multi-step transaction flow (Approve -> Register) required to list a new service.
*   **`verifyEndpoint()`**: Performs liveness checks on x402-enabled endpoints.

## Installation

```bash
npm install @asap-protocol/sdk viem
```

## Usage Example

```typescript
import { ASAPSDK } from '@asap-protocol/sdk';

// Initialize
const sdk = new ASAPSDK('0xRegistryAddress...');

// 1. Find a service
const agents = await sdk.discover();
const target = agents.find(a => a.metadata.name === "Oracle");

// 2. Interact (Pseudo-code for agent logic)
if (target) {
    console.log(`Found target at ${target.endpointUrl}`);
    // Proceed to x402 handshake...
}
```