import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SmoothScrollWrapper from './SmoothScrollWrapper';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <SmoothScrollWrapper>
            <div className="min-h-screen bg-void text-primary font-sans selection:bg-accent selection:text-white flex flex-col subtle-grid">
                <Navbar />
                <main className="flex-grow pt-24 px-6 max-w-[1400px] mx-auto w-full">
                    {children}
                </main>
                <Footer />
            </div>
        </SmoothScrollWrapper>
    );
}
