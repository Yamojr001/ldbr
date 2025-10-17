// src/App.tsx (FINALIZED with Button import fix)

import React from 'react';
import { EthersProvider } from '@/context/EthersContext'; 
import HeroSection from './components/LandingPage/HeroSection';
import FeatureGrid from './components/LandingPage/FeatureGrid';
import Header from './components/Header';
import ManagerDashboard from './pages/ManagerDashboard'; 
import { useManagerAuth } from './hooks/useManagerAuth'; 
import { Toaster } from './components/ui/toaster'; 
import StaffLoginForm from './components/Sales/StaffLoginForm'; 
import { Loader2 } from 'lucide-react';
import { useEthers } from './context/EthersContext'; 

// FIX: ADD THIS MISSING IMPORT
import { Button } from './components/ui/button'; 

const RootView: React.FC = () => {
    const { isManager, isConnected, isLoadingAuth, address } = useManagerAuth();
    const { disconnectWallet } = useEthers();
    const TARGET_MANAGER_ADDRESS = '0x9261D7bf531633C3C13FBfc28240663dF8130024';

    if (isLoadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="flex items-center">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-cyan-400" />
                    <p>Loading Web3 Authentication...</p>
                </div>
            </div>
        );
    }
    
    // Check for the specific UNAUTHORIZED scenario
    if (isConnected && !isManager) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-950/20 text-white p-8">
                <div className="bg-gray-900 p-8 rounded-lg border border-red-700 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied: Not Manager</h2>
                    <p className="text-gray-400 mb-4">Connected Wallet: **{address}**.</p>
                    <p className="text-sm text-yellow-400 mb-6">Manager role is granted on-chain to the wallet used for contract deployment or the address provided during the contract's constructor.</p>
                    <Button onClick={disconnectWallet} variant="secondary">
                        Disconnect Wallet
                    </Button>
                </div>
            </div>
        );
    }
    
    // RENDER 1: Manager Dashboard
    if (isConnected && isManager) {
        return <ManagerDashboard />;
    }

    // RENDER 2: Public Landing Page 
    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <Header />
            <main>
                <HeroSection />
                <FeatureGrid />
                {/* Staff Login Area - Must create StaffLoginForm.tsx */}
                <div id="staff-login" className="py-20 bg-gray-950/50 flex justify-center">
                    <StaffLoginForm /> 
                </div>
            </main>
            {/* Must create Footer.tsx */}
        </div>
    );
}

const App: React.FC = () => {
  return (
    <EthersProvider>
        <RootView /> 
        <Toaster /> 
    </EthersProvider>
  );
};

export default App;