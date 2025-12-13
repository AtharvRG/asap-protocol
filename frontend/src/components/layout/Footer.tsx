export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-void py-12 mt-32">
            <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-secondary text-sm font-mono">
                    © 2024 ASAP_PROTOCOL. SYSTEM_ONLINE.
                </div>
                <div className="flex gap-8">
                    <a href="https://x.com/AGachchi" target="_blank" className="text-secondary hover:text-primary transition-colors text-sm uppercase tracking-wider">Twitter</a>
                    <a href="https://github.com/AtharvRG" target="_blank" className="text-secondary hover:text-primary transition-colors text-sm uppercase tracking-wider">GitHub</a>
                    <a href="https://anchor-arg.vercel.app" target="_blank" className="text-secondary hover:text-primary transition-colors text-sm uppercase tracking-wider">Anchor</a>
                </div>
            </div>
        </footer>
    );
}
