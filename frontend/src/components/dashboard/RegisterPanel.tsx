import { useState } from 'react';
import { useWriteContract, usePublicClient, useAccount, useReadContract } from 'wagmi';
import { Server, AlertTriangle } from 'lucide-react';
import { REGISTRY_ABI, TOKEN_ABI } from '../../abi';

const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS as `0x${string}`;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}`;
const STAKE_AMOUNT = BigInt("100000000000000000000"); // 100 Tokens

export default function RegisterPanel() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const [formData, setFormData] = useState({ fid: '', url: '', name: '' });
    const [status, setStatus] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // 1. READ ALLOWANCE AUTOMATICALLY
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'allowance',
        args: address ? [address, REGISTRY_ADDRESS] : undefined,
    });

    const handleRegisterClick = async () => {
        if (!formData.fid || !formData.url || !formData.name) {
            setStatus('Please fill all fields');
            return;
        }

        setIsChecking(true);
        setStatus('🔍 Checking Endpoint Connectivity...');

        try {
            // Attempt to fetch the endpoint
            // We use a short timeout to avoid waiting too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(formData.url, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // If we get here, the server is reachable (even if 404 or 402 or 500)
            // We consider it "Alive" enough to proceed automatically
            await executeRegistration(false);

        } catch (error) {
            // Network error, timeout, or CORS block (which usually implies we can't verify it)
            console.warn("Endpoint check failed:", error);
            setShowWarning(true);
            setStatus('');
        } finally {
            setIsChecking(false);
        }
    };

    const executeRegistration = async (isSimulation: boolean) => {
        if (!publicClient) return;
        setShowWarning(false); // Close modal if open

        try {
            // CHECK: Do we need to approve?
            const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n;

            if (currentAllowance < STAKE_AMOUNT) {
                // STEP 1: APPROVE (Only if needed)
                setStatus('⏳ Approving tokens (Please Confirm in Wallet)...');

                const approveHash = await writeContractAsync({
                    address: TOKEN_ADDRESS,
                    abi: TOKEN_ABI,
                    functionName: 'approve',
                    args: [REGISTRY_ADDRESS, STAKE_AMOUNT]
                });

                setStatus('⏳ Waiting for Approval to confirm...');
                await publicClient.waitForTransactionReceipt({ hash: approveHash });

                // Refresh allowance data
                await refetchAllowance();
            } else {
                console.log("Skipping approval, already sufficient.");
            }

            // STEP 2: REGISTER
            setStatus('⏳ Registering service (Please Confirm in Wallet)...');

            const metadata = {
                name: formData.name,
                type: isSimulation ? 'simulation' : 'real'
            };

            const registerHash = await writeContractAsync({
                address: REGISTRY_ADDRESS,
                abi: REGISTRY_ABI,
                functionName: 'registerService',
                args: [
                    BigInt(formData.fid),
                    formData.url,
                    JSON.stringify(metadata),
                    STAKE_AMOUNT
                ]
            });

            setStatus('⏳ Waiting for Registration to confirm...');
            await publicClient.waitForTransactionReceipt({ hash: registerHash });

            setStatus('✅ Success! Service Registered.');
            setFormData({ fid: '', url: '', name: '' });

        } catch (e) {
            console.error(e);
            setStatus('❌ Error: ' + (e as Error).message.slice(0, 50));
        }
    };

    return (
        <div className="max-w-xl mx-auto relative">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2 font-heading">
                    <Server className="text-primary" />
                    Register New Agent
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Farcaster FID</label>
                        <input
                            type="number"
                            value={formData.fid}
                            className="w-full bg-black/40 border border-white/10 focus:border-primary p-3 rounded-xl text-white outline-none transition-colors"
                            placeholder="e.g. 1234"
                            onChange={e => setFormData({ ...formData, fid: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            className="w-full bg-black/40 border border-white/10 focus:border-primary p-3 rounded-xl text-white outline-none transition-colors"
                            placeholder="e.g. Weather Bot"
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Endpoint URL (x402)</label>
                        <input
                            type="text"
                            value={formData.url}
                            className="w-full bg-black/40 border border-white/10 focus:border-primary p-3 rounded-xl text-white outline-none transition-colors"
                            placeholder="https://..."
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleRegisterClick}
                            disabled={isChecking}
                            className={`w-full font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] ${isChecking
                                    ? 'bg-primary/50 text-black cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-400 text-black'
                                }`}
                        >
                            {isChecking ? 'Checking Endpoint...' : 'Stake 100 ASAP & Register'}
                        </button>
                        {status && <p className="mt-4 text-center text-sm font-mono text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">{status}</p>}
                    </div>
                </div>
            </div>

            {/* WARNING MODAL */}
            {showWarning && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                    <div className="bg-surface border border-yellow-500/30 p-6 rounded-xl max-w-sm w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-yellow-500 mb-4">
                            <AlertTriangle className="w-8 h-8" />
                            <h3 className="text-lg font-bold font-heading">Endpoint Unreachable</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                            We couldn't verify a live connection to <span className="text-white font-mono bg-white/10 px-1 rounded">{formData.url}</span>.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => executeRegistration(true)}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors text-sm"
                            >
                                Proceed as Simulation
                            </button>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg transition-colors text-sm border border-white/10"
                            >
                                Cancel Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}