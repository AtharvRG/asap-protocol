import { motion } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';

export default function HeroSection({ onStart }: { onStart: () => void }) {
    return (
        <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden border-b border-white/10">
            <div className="max-w-[1400px] mx-auto px-6 w-full grid lg:grid-cols-12 gap-12 items-end pb-20">
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-3 mb-8 border-l-2 border-accent pl-4">
                            <span className="text-sm font-mono text-secondary uppercase tracking-widest">
                                Protocol V0.1 (Beta) // Live on Sepolia
                            </span>
                        </div>

                        <h1 className="text-7xl lg:text-[10rem] font-heading font-bold leading-[0.85] tracking-tighter mb-10 text-primary uppercase">
                            Automate<br />
                            <span className="text-secondary">Everything</span>
                        </h1>

                        <p className="text-xl text-secondary mb-12 max-w-xl leading-relaxed font-sans border-l border-white/10 pl-6">
                            The first decentralized registry for AI Agents.
                            Discover, connect, and transact with autonomous services using the x402 protocol.
                        </p>

                        <div className="flex flex-wrap gap-0">
                            <button
                                onClick={onStart}
                                className="px-10 py-5 bg-primary hover:bg-accent text-void hover:text-white font-bold text-lg transition-colors uppercase tracking-wide flex items-center gap-3"
                            >
                                Start Building
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button onClick={() => window.open('https://chameleon-anchor.vercel.app/p/asap-protocol', '_blank')} className="px-10 py-5 bg-transparent border border-white/20 hover:border-primary text-primary font-bold text-lg transition-colors uppercase tracking-wide backdrop-blur-none">
                                Read Documentation
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-end h-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="border border-white/10 p-8 bg-surface/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <Terminal className="w-8 h-8 text-accent" />
                            <span className="font-mono text-xs text-secondary">SYS_STATUS: ONLINE</span>
                        </div>
                        <div className="space-y-4 font-mono text-sm text-secondary">
                            <div className="flex justify-between">
                                <span>&gt; CONNECTING_PEERS</span>
                                <span className="text-primary">OK</span>
                            </div>
                            <div className="flex justify-between">
                                <span>&gt; SYNC_REGISTRY</span>
                                <span className="text-primary">OK</span>
                            </div>
                            <div className="flex justify-between">
                                <span>&gt; VERIFY_SIGNATURE</span>
                                <span className="text-accent">VERIFIED</span>
                            </div>
                            <div className="h-px bg-white/5 my-4" />
                            <div className="text-xs opacity-50">
                                // The x402 protocol enables trustless agent-to-agent communication.
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />
                <div className="absolute right-6 top-0 bottom-0 w-px bg-white/5" />
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/5 hidden lg:block" />
                <div className="absolute left-2/4 top-0 bottom-0 w-px bg-white/5 hidden lg:block" />
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/5 hidden lg:block" />
            </div>
        </section>
    );
}
