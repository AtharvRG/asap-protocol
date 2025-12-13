import { Terminal, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TOKEN_ABI } from '../../abi';
import { useEffect } from 'react';
import { Link } from 'react-router-dom'; // <--- Import Link

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}`;

export default function Navbar() {
    const { isConnected, address } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-void/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                {/* 1. WRAP LOGO IN LINK */}
                <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Terminal className="text-black w-6 h-6" />
                    </div>
                    <span className="text-2xl font-heading font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                        ASAP<span className="text-primary">_Protocol</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {!isConnected ? (
                        connectors.slice(0, 1).map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => connect({ connector })}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-400 text-black px-6 py-2.5 rounded-lg font-bold font-heading transition-all hover:scale-105 active:scale-95"
                            >
                                <Wallet className="w-5 h-5" />
                                Connect Wallet
                            </button>
                        ))
                    ) : (
                        <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-2 h-2 bg-primary rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                <span className="font-mono text-sm text-gray-300">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </span>
                            </div>
                            <FaucetButton />
                            <button
                                onClick={() => disconnect()}
                                className="text-xs text-red-400 hover:text-red-300 px-3 py-1 hover:bg-red-500/10 rounded transition-colors border-l border-white/5"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

function FaucetButton() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: balance, refetch } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 1000, // <--- THE MAGIC FIX: Poll every 1 second
        }
    });

    useEffect(() => {
        if (isConfirmed) {
            refetch();
        }
    }, [isConfirmed, refetch]);

    const handleMint = () => {
        writeContract({
            address: TOKEN_ADDRESS,
            abi: TOKEN_ABI,
            functionName: 'faucet',
            args: []
        });
    };

    const formattedBalance = balance ? (Number(balance) / 1e18).toFixed(0) : '0';
    const isPending = isWritePending || isConfirming;

    return (
        <div className="flex items-center gap-3 border-l border-white/10 pl-3">
            <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/5 text-xs font-mono text-primary shadow-[0_0_10px_-5px_white]">
                {formattedBalance} <span className="bg-white text-black px-1 rounded">$ASAP</span>
            </div>
            <button
                onClick={handleMint}
                disabled={isPending}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-bold font-heading ${isPending
                    ? 'bg-primary-900/20 text-primary-600 border-primary-900/50 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-400 text-black border-primary hover:shadow-[0_0_20px_-5px_#10b981]'
                    }`}
            >
                {isPending ? 'Minting...' : '+ Faucet'}
            </button>
        </div>
    );
}