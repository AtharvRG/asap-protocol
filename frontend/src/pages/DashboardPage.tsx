import { useState } from 'react';
import { Search, Server, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DiscoveryPanel from '../components/dashboard/DiscoveryPanel';
import RegisterPanel from '../components/dashboard/RegisterPanel';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'discover' | 'register'>('discover');

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
            {/* Back Button / Header area */}
            <div className="mb-8 flex items-center gap-4">
                <Link to="/" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-heading font-bold text-white">Agent Dashboard</h1>
            </div>

            <div className="flex gap-6 mb-10 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`pb-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'discover'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <Search className="w-4 h-4" />
                    Discover Agents
                </button>
                <button
                    onClick={() => setActiveTab('register')}
                    className={`pb-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'register'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <Server className="w-4 h-4" />
                    Register Service
                </button>
            </div>

            {activeTab === 'discover' ? <DiscoveryPanel /> : <RegisterPanel />}
        </div>
    );
}