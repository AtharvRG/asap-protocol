import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLET_CONNECT_ID

export const config = createConfig({
    chains: [sepolia],
    connectors: [
        injected(),
        walletConnect({ projectId }),
    ],
    transports: {
        // We use a specific, reliable public node here
        [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    },
})