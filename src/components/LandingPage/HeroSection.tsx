// src/components/LandingPage/HeroSection.tsx

import React from 'react';
import { Button } from '../ui/button';
import { MoveRight, LockKeyhole } from 'lucide-react';
import WalletConnectButton from '../auth/WalletConnectButton';

const HeroSection: React.FC = () => {
    
    const handleStaffLogin = () => {
        document.getElementById('staff-login')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    return (
        <section className="relative h-[85vh] flex items-center justify-center text-center bg-black overflow-hidden">
            {/* Background Gradient Effect (Subtle Tech Look) */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-color-cyan-900)_0%,_transparent_60%)]"></div>
            
            <div className="container z-10 max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Tag/Badge */}
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-cyan-300 bg-cyan-900/40 rounded-full border border-cyan-500/50 uppercase tracking-wider">
                    BlockDAG Architecture for Speed & Trust
                </div>

                {/* Main Headline */}
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white leading-snug">
                    Unbreakable. Encrypted. Ledger $DAG$.
                </h1>

                {/* Sub-headline */}
                <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
                    The only business record system where all customer data, inventory, and transactions are **fully AES-encrypted** and stored immutably on a BlockDAG.
                </p>

                {/* Call to Action Buttons */}
                <div className="mt-10 flex justify-center space-x-4">
                    {/* Manager CTA: Uses the real wallet connection component */}
                    <div className="shadow-lg shadow-cyan-500/30">
                        <WalletConnectButton />
                    </div>
                    
                    {/* Staff/General CTA */}
                    <Button 
                        size="lg"
                        variant="outline" 
                        className="h-12 px-6 border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium text-lg"
                        onClick={handleStaffLogin}
                    >
                        Staff Login <MoveRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;