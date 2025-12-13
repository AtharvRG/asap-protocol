import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Terminal, Wallet, Loader2 } from 'lucide-react';
import { TOKEN_ABI } from '../../abi';

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}`;

export default function TestAgentModal({ service, onClose }: { service: any, onClose: () => void }) {
    const { writeContractAsync, isPending: isWalletOpening } = useWriteContract();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<'idle' | 'calling' | 'paying' | 'success'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // Guard to prevent double-firing of success logic
    const hasHandledSuccess = useRef(false);

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    // Lock background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // ---------------------------------------------------------
    // STEP 3: AFTER PAYMENT CONFIRMED -> FETCH DATA
    // ---------------------------------------------------------
    useEffect(() => {
        const handleSuccess = async () => {
            // Only run if confirmed, in paying step, and NOT already handled
            if (isConfirmed && step === 'paying' && txHash && !hasHandledSuccess.current) {
                hasHandledSuccess.current = true; // Mark as handled immediately

                setStep('success');
                addLog("🎉 PAYMENT CONFIRMED");

                // Refresh Balance
                setTimeout(() => queryClient.invalidateQueries(), 1000);

                // CHECK: Is this the Real Oracle or the Dummy?
                const isRealOracle = service.endpointUrl.includes('netlify');

                if (isRealOracle) {
                    // --- REAL PATH (Netlify) ---
                    addLog("🔓 Sending Proof to Endpoint...");
                    try {
                        const response = await fetch(service.endpointUrl, {
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${txHash}` }
                        });

                        const data = await response.json();

                        if (response.ok) {
                            addLog("✅ ACCESS GRANTED! ");
                            addLog("--------------------------------");
                            addLog(`🔮 Prediction: ${data.data.prediction}`);
                            addLog(`📊 Confidence: ${data.data.confidence}`);
                            addLog(`🔑 Secret: ${data.data.secret_key}`);
                            addLog("--------------------------------");
                        } else {
                            addLog(`❌ Oracle Rejected: ${data.error}`);
                        }
                    } catch (e) {
                        addLog("❌ Failed to fetch data from endpoint.");
                    }
                } else {
                    // --- SIMULATION PATH (Clean & Random) ---
                    // No "Sending Proof" log here, just straight result
                    await new Promise(r => setTimeout(r, 1000));

                    const randomSecret1 = Math.floor(Math.random() * 90) + 10;
                    const randomSecret2 = Math.floor(Math.random() * 90) + 10;
                    const randomSecret3 = Math.floor(Math.random() * 90) + 10;

                    addLog("✅ ACCESS GRANTED!");
                    addLog("--------------------------------");
                    addLog(`🔑 Secret Key Array: ${randomSecret1}, ${randomSecret2}, ${randomSecret3}`);
                    addLog("--------------------------------");
                }
            }
        };

        handleSuccess();
    }, [isConfirmed, step, txHash, queryClient, service.endpointUrl]);

    // ---------------------------------------------------------
    // STEP 1: INITIAL HANDSHAKE
    // ---------------------------------------------------------
    const startHandshake = async () => {
        setStep('calling');
        addLog(`GET ${service.endpointUrl}...`);

        try {
            const res = await fetch(service.endpointUrl);

            if (res.status === 402) {
                const data = await res.json();
                addLog(`❌ Error: 402 Payment Required`);
                addLog(`⚠️ Server says: "${data.message}"`);
                setStep('paying');
            } else if (res.status === 200) {
                addLog("✅ Service is free!");
                const data = await res.json();
                addLog(`Data: ${JSON.stringify(data)}`);
            } else {
                throw new Error("Network Error");
            }
        } catch (e) {
            // Clean Simulation Logs
            addLog("⚠️ Connection failed (Simulating 402)");
            await new Promise(r => setTimeout(r, 800));
            addLog("❌ Error: 402 Payment Required");
            setStep('paying');
        }
    };

    // ---------------------------------------------------------
    // STEP 2: PAY ON CHAIN
    // ---------------------------------------------------------
    const payAndRetry = async () => {
        if (isWalletOpening) return;

        try {
            addLog("💸 Opening Wallet to pay 1 ASAP...");

            const hash = await writeContractAsync({
                address: TOKEN_ADDRESS,
                abi: TOKEN_ABI,
                functionName: 'transfer',
                args: [service.provider, BigInt("1000000000000000000")]
            });

            setTxHash(hash);
            addLog(`✅ Tx Sent: ${hash.slice(0, 10)}...`);
            addLog("⏳ Waiting for confirmation...");

        } catch (e: any) {
            console.error(e);
            if (e.message.includes("User rejected")) {
                addLog("❌ You rejected the transaction");
            } else {
                addLog(`❌ Error: ${e.shortMessage || e.message.slice(0, 20)}...`);
            }
        }
    };

    const isProcessing = isWalletOpening || isConfirming;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-dark border border-primary/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-primary/10 flex flex-col max-h-[90vh]">
                <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10 shrink-0">
                    <h3 className="font-bold text-white flex items-center gap-2 font-heading">
                        <Terminal className="w-4 h-4 text-primary" />
                        x402 Handshake Console
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="bg-black p-4 flex-grow overflow-y-auto font-mono text-xs space-y-2 border-b border-white/10 custom-scrollbar overscroll-contain">
                    <div className="text-gray-500"># Connecting to {service.endpointUrl}</div>
                    {logs.map((log, i) => (
                        <div key={i} className={`break-words ${log.includes('Error') || log.includes('Rejected') ? 'text-red-400' :
                            log.includes('SUCCESS') || log.includes('GRANTED') ? 'text-primary' :
                                log.includes('Secret') ? 'text-green-400' :
                                    log.includes('Tx') ? 'text-blue-400' : 'text-gray-300'
                            }`}>
                            {log}
                        </div>
                    ))}
                    {(step === 'calling' || isProcessing) && <div className="animate-pulse text-primary">_</div>}
                </div>

                <div className="p-6 bg-white/5 shrink-0">
                    {step === 'idle' && (
                        <button onClick={startHandshake} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02]">
                            Test Endpoint Connectivity
                        </button>
                    )}

                    {step === 'paying' && !isProcessing && (
                        <button
                            onClick={payAndRetry}
                            disabled={isWalletOpening}
                            className="w-full bg-primary hover:bg-primary-400 text-black font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
                        >
                            <Wallet className="w-5 h-5" />
                            Pay 1 ASAP & Access
                        </button>
                    )}

                    {step === 'paying' && isProcessing && (
                        <button disabled className="w-full bg-primary/20 text-primary font-bold py-3 rounded-xl flex justify-center items-center gap-2 cursor-not-allowed">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isWalletOpening ? 'Check Wallet...' : 'Confirming Transaction...'}
                        </button>
                    )}

                    {step === 'success' && (
                        <button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all">
                            Close Session
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}