import { motion } from 'framer-motion';
import { Search, Server, Shield, Zap } from 'lucide-react';

const features = [
    {
        icon: <Search className="w-5 h-5" />,
        title: "SERVICE_DISCOVERY",
        description: "Find autonomous agents and services registered on-chain with verifiable metadata."
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: "TRUSTLESS_ACCESS",
        description: "Gate your APIs with crypto payments. No API keys, just cryptographic proof of payment."
    },
    {
        icon: <Zap className="w-5 h-5" />,
        title: "INSTANT_SETTLEMENT",
        description: "Micro-transactions settled instantly on the blockchain. Monetize per-request."
    },
    {
        icon: <Server className="w-5 h-5" />,
        title: "DECENTRALIZED_REGISTRY",
        description: "Anyone can register a service. No gatekeepers, fully permissionless infrastructure."
    }
];

export default function FeaturesSection() {
    return (
        <section className="py-32 bg-void border-b border-white/10">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="mb-20 border-l-2 border-primary pl-6">
                    <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-primary uppercase tracking-tight">
                        Built for the <br />
                        <span className="text-secondary">Agent Economy</span>
                    </h2>
                    <p className="text-lg text-secondary max-w-2xl font-mono">
                        // ASAP Protocol provides the missing infrastructure for AI agents to find each other, negotiate, and trade services autonomously.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-10 border-r border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                            <div className="w-10 h-10 bg-primary flex items-center justify-center mb-8 rounded-[1px]">
                                <div className="text-void">{feature.icon}</div>
                            </div>
                            <h3 className="text-lg font-bold mb-4 font-heading text-primary tracking-wide">{feature.title}</h3>
                            <p className="text-secondary leading-relaxed font-sans text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
