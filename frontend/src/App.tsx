import { useState, useEffect } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia } from 'viem/chains'
// ADDED: useReadContract is now imported here
import { WagmiProvider, useAccount, useConnect, useDisconnect, useWriteContract, useReadContract } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config'
import { REGISTRY_ABI, TOKEN_ABI } from './abi'
import { Search, Server, ShieldCheck, Wallet, Terminal } from 'lucide-react'

const queryClient = new QueryClient()

// Constants
const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS as `0x${string}`;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}`;

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Main />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function Main() {
  const { isConnected, address } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [activeTab, setActiveTab] = useState<'discover' | 'register'>('discover')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-yellow-500 selection:text-black">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
              <Terminal className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ASAP<span className="text-yellow-500">_Protocol</span></span>
          </div>

          <div className="flex items-center gap-4">
            {!isConnected ? (
              connectors.slice(0, 1).map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              ))
            ) : (
              <div className="flex items-center gap-3 bg-gray-800 py-1 px-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-sm text-gray-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                {/* Fixed Faucet Button */}
                <FaucetButton />
                <button
                  onClick={() => disconnect()}
                  className="text-xs text-red-400 hover:text-red-300 px-2 border-l border-gray-600"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-6 mb-10 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'discover'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
          >
            <Search className="w-4 h-4" />
            Discover Agents
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'register'
              ? 'border-yellow-500 text-yellow-500'
              : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
          >
            <Server className="w-4 h-4" />
            Register Service
          </button>
        </div>

        {activeTab === 'discover' ? <DiscoveryPanel /> : <RegisterPanel />}
      </main>
    </div>
  )
}

function FaucetButton() {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Safely read balance
  const { data: balance, refetch } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Only run if address exists
    }
  });

  const handleMint = () => {
    writeContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'faucet',
      args: []
    }, {
      onSuccess: () => {
        setTimeout(() => refetch(), 4000); // Refresh after 4s
      }
    });
  };

  const formattedBalance = balance ? (Number(balance) / 1e18).toFixed(0) : '0';

  return (
    <div className="flex items-center gap-2 border-l border-gray-600 pl-3">
      <div className="px-2 py-0.5 bg-gray-900 rounded border border-gray-700 text-xs font-mono text-yellow-500">
        {formattedBalance} $ASAP
      </div>
      <button
        onClick={handleMint}
        disabled={isPending}
        className={`text-xs px-2 py-1 rounded border transition-colors ${isPending
          ? 'bg-yellow-900/20 text-yellow-600 border-yellow-900/50 cursor-not-allowed'
          : 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-600 font-bold'
          }`}
      >
        {isPending ? 'Minting...' : '+ Faucet'}
      </button>
    </div>
  )
}

function RegisterPanel() {
  const { writeContractAsync } = useWriteContract()
  const [formData, setFormData] = useState({ fid: '', url: '', name: '' })
  const [status, setStatus] = useState('')

  const handleRegister = async () => {
    if (!formData.fid || !formData.url || !formData.name) {
      setStatus('Please fill all fields');
      return;
    }
    try {
      setStatus('⏳ Approving tokens...')
      await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [REGISTRY_ADDRESS, BigInt("100000000000000000000")]
      })

      setStatus('⏳ Registering service...')
      await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'registerService',
        args: [
          BigInt(formData.fid),
          formData.url,
          JSON.stringify({ name: formData.name }),
          BigInt("100000000000000000000")
        ]
      })
      setStatus('✅ Success! Service Registered.')
    } catch (e) {
      console.error(e)
      setStatus('❌ Error: ' + (e as Error).message.slice(0, 50))
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Server className="text-yellow-500" />
          Register New Agent
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Farcaster FID</label>
            <input
              type="number"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 p-3 rounded-lg text-white outline-none transition-colors"
              placeholder="e.g. 1234"
              onChange={e => setFormData({ ...formData, fid: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
            <input
              type="text"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 p-3 rounded-lg text-white outline-none transition-colors"
              placeholder="e.g. Weather Bot"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Endpoint URL (x402)</label>
            <input
              type="text"
              className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 p-3 rounded-lg text-white outline-none transition-colors"
              placeholder="https://..."
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleRegister}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-lg shadow-lg shadow-yellow-500/20 transition-all"
            >
              Stake 100 ASAP & Register
            </button>
            {status && <p className="mt-4 text-center text-sm font-mono text-gray-300 bg-gray-800 p-2 rounded">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function DiscoveryPanel() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<any>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch from Indexer
        const res = await fetch('http://localhost:3000/services');
        const data = await res.json();

        const formatted = data.map((s: any) => ({
          id: s.id,
          provider: s.provider,
          farcasterId: s.farcaster_id,
          endpointUrl: s.endpoint,
          metadata: s.metadata || '{}',
          reputation: 0,
          isActive: true
        }));

        setServices(formatted);
      } catch (e) {
        console.error("Indexer fetch failed", e)
      } finally {
        setLoading(false)
      }
    }

    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading Agents from Indexer...</div>

  if (services.length === 0) return (
    <div className="text-center py-20">
      <div className="inline-block p-4 rounded-full bg-gray-800 mb-4"><Search className="w-8 h-8 text-gray-600" /></div>
      <h3 className="text-xl font-bold text-gray-300">No Agents Found</h3>
      <p className="text-gray-500">The Indexer hasn't found any services yet.</p>
    </div>
  )

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => {
          // --- SAFETY SHIELD START ---
          let meta = { name: 'Unknown Agent' };
          try {
            // Only parse if it looks like JSON, otherwise use raw string or default
            if (s.metadata && s.metadata.startsWith('{')) {
              meta = JSON.parse(s.metadata);
            } else if (s.metadata) {
              meta = { name: s.metadata }; // Handle cases where metadata is just a name string
            }
          } catch (e) {
            console.warn("Failed to parse metadata for", s.id);
          }
          // --- SAFETY SHIELD END ---

          return (
            <div key={Number(s.id)} className="group bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-yellow-500/50 transition-all hover:shadow-xl hover:shadow-yellow-500/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">{meta.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/20">FID: {Number(s.farcasterId)}</span>
                  </div>
                </div>
                <ShieldCheck className="text-green-500 w-5 h-5" />
              </div>

              <div className="bg-gray-950 p-3 rounded border border-gray-800 mb-4 font-mono text-xs text-gray-400 truncate">
                {s.endpointUrl}
              </div>

              <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-4 mt-2">
                <span className="flex items-center gap-1.5 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
                <span className="text-gray-500 font-medium">Rep: {Number(s.reputation)}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => setSelectedService(s)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded transition-colors"
                >
                  Test Endpoint
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {selectedService && (
        <TestAgentModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  )
}

function TestAgentModal({ service, onClose }: { service: any, onClose: () => void }) {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const [step, setStep] = useState<'idle' | 'calling' | 'paying' | 'success'>('idle')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`])

  const startHandshake = async () => {
    setStep('calling')
    addLog(`GET ${service.endpointUrl}...`)

    // DEMO MAGIC: We simulate a network delay
    await new Promise(r => setTimeout(r, 1000))

    // DEMO MAGIC: We force a 402 error to show the protocol working
    addLog("❌ Error: 402 Payment Required")
    addLog("⚠️ Access Denied. Rate: 1 ASAP/request")

    setStep('paying')
  }

  const payAndRetry = async () => {
    try {
      addLog("💸 Opening Wallet to pay 1 ASAP...")

      // THIS IS THE REAL BLOCKCHAIN PART
      const hash = await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [service.provider, BigInt("1000000000000000000")] // 1 Token
      })

      addLog(`✅ Tx Sent: ${hash.slice(0, 10)}...`)
      addLog("⏳ Waiting for confirmation...")

      // Simulate waiting for block confirmation (just a delay for the demo)
      await new Promise(r => setTimeout(r, 4000))

      setStep('success')
      addLog("🎉 PAYMENT CONFIRMED")
      addLog("🔓 Access Granted. Secret Data: [84, 22, 19]")

    } catch (e: any) {
      // NOW WE WILL SEE THE REAL REASON
      console.error(e);
      if (e.message.includes("User rejected")) {
        addLog("❌ You rejected the transaction in MetaMask")
      } else {
        addLog(`❌ Error: ${e.shortMessage || e.message.slice(0, 20)}...`)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-yellow-500/30 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-yellow-500" />
            x402 Handshake Console
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="bg-black p-4 h-64 overflow-y-auto font-mono text-xs space-y-2 border-b border-gray-800">
          <div className="text-gray-500"># Connecting to {service.endpointUrl}</div>
          {logs.map((log, i) => (
            <div key={i} className={`break-words ${log.includes('Error') || log.includes('rejected') ? 'text-red-400' :
              log.includes('SUCCESS') || log.includes('CONFIRMED') ? 'text-green-400' :
                log.includes('Tx') ? 'text-blue-400' : 'text-gray-300'
              }`}>
              {log}
            </div>
          ))}
          {step === 'calling' && <div className="animate-pulse text-yellow-500">_</div>}
        </div>

        <div className="p-4 bg-gray-800">
          {step === 'idle' && (
            <button onClick={startHandshake} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors">
              Test Endpoint Connectivity
            </button>
          )}

          {step === 'paying' && (
            <button onClick={payAndRetry} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded flex justify-center gap-2 transition-colors shadow-lg shadow-yellow-500/20">
              <Wallet className="w-5 h-5" />
              Pay 1 ASAP & Access
            </button>
          )}

          {step === 'success' && (
            <button onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded transition-colors">
              Close Session
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default App