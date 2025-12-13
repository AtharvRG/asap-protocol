# ASAP Indexer Service

**The "Search Engine" for the decentralized agent registry.**

Direct blockchain queries are slow, expensive, and difficult to filter. The ASAP Indexer solves the "Read Scalability" problem by listening to on-chain events and projecting the state into a high-performance local database.

## How It Works

The service runs a continuous polling loop (`src/index.ts`) that synchronizes with the blockchain:

1.  **Event Ingestion:** Listens for `ServiceRegistered` events from the Registry contract.
2.  **Smart Metadata Resolution:** Since the contract emits minimal data to save gas, the Indexer performs a secondary `readContract` call to fetch the full metadata JSON string for each new service.
3.  **Persistence:** Data is normalized and stored in a local SQLite database (`asap.db`).
4.  **API:** Exposes a RESTful endpoint (`GET /services`) that the Frontend and Agents use for instant discovery.

## Technical Stack
*   **Runtime:** Node.js / TypeScript
*   **Blockchain Client:** Viem (Lightweight, type-safe)
*   **Database:** Better-SQLite3 (Serverless, zero-latency)
*   **Server:** Express

## Usage

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configuration:**
    Ensure `src/index.ts` points to the correct `REGISTRY_ADDRESS` and RPC URL.

3.  **Run Service:**
    ```bash
    npx ts-node src/index.ts
    ```
    *Output:*
    > 🚀 Smart Indexer running on Ethereum Sepolia
    > 🔍 Scanning...
    > ✅ Indexed: {"name":"Genesis Agent"}

4.  **Reset:**
    To force a re-index, simply delete the `asap.db` file and restart.