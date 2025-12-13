import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import TestAgentModal from './TestAgentModal';
import { motion } from 'framer-motion';

export default function DiscoveryPanel() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<any>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
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
                console.error("Indexer fetch failed", e);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
        const interval = setInterval(fetchServices, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-left py-20 text-secondary font-mono text-sm uppercase tracking-wider">&gt;&gt; INITIALIZING_REGISTRY_SCAN...</div>;

    if (services.length === 0) return (
        <div className="text-left py-20 border-t border-white/10">
            <div className="flex items-center gap-4 mb-4">
                <Search className="w-6 h-6 text-secondary" />
                <h3 className="text-xl font-bold text-primary font-heading uppercase">No Agents Found</h3>
            </div>
            <p className="text-secondary font-mono text-sm">&gt;&gt; INDEXER_STATUS: IDLE</p>
        </div>
    );

    return (
        <div>
            {/* Data Grid Header */}
            <div className="grid grid-cols-12 gap-4 px-4 border-b border-white/20 pb-4 mb-4 text-xs font-mono text-secondary uppercase tracking-wider">
                <div className="col-span-4">Agent Name / ID</div>
                <div className="col-span-4">Endpoint</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="space-y-0">
                {services.map((s, i) => {
                    let meta = { name: 'UNKNOWN_AGENT' };
                    try {
                        if (s.metadata && s.metadata.startsWith('{')) {
                            meta = JSON.parse(s.metadata);
                        } else if (s.metadata) {
                            meta = { name: s.metadata };
                        }
                    } catch (e) {
                        console.warn("Failed to parse metadata", s.id);
                    }

                    return (
                        <motion.div
                            key={Number(s.id)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-white/5 items-center hover:bg-white/5 transition-all group rounded-xl hover:shadow-lg hover:border-transparent"
                        >
                            <div className="col-span-4">
                                <h3 className="font-bold text-base text-primary font-heading uppercase tracking-tight group-hover:text-accent transition-colors">
                                    {meta.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-secondary text-xs font-mono">FID: {Number(s.farcasterId)}</span>
                                </div>
                            </div>

                            <div className="col-span-4 font-mono text-xs text-secondary truncate pr-4">
                                {s.endpointUrl}
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-accent rounded-none"></div>
                                <span className="text-xs font-mono text-primary uppercase">Active</span>
                            </div>

                            <div className="col-span-2 text-right">
                                <button
                                    onClick={() => setSelectedService(s)}
                                    className="text-xs font-bold font-heading uppercase tracking-wide text-primary hover:text-accent border border-white/10 hover:border-accent px-4 py-2 transition-all"
                                >
                                    Test_Agent
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {selectedService && (
                <TestAgentModal
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </div>
    );
}
