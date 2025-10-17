// src/App.tsx (FINALIZED with Debug UI)

import React, { useState, useEffect } from 'react';
import { EthersProvider, useEthers } from '@/context/EthersContext'; 
import HeroSection from './components/LandingPage/HeroSection';
import FeatureGrid from './components/LandingPage/FeatureGrid';
import Header from './components/Header';
import ManagerDashboard from './pages/ManagerDashboard'; 
import { useManagerAuth } from './hooks/useManagerAuth'; 
import { Toaster } from './components/ui/toaster'; 
import StaffLoginForm from './components/Sales/StaffLoginForm'; 
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button'; 
import { Separator } from './components/ui/separator'; 

const RootView: React.FC = () => {
    // Hooks
    const { isManager, isConnected, isLoadingAuth, address } = useManagerAuth();
    const { disconnectWallet, getManagerWalletAddress } = useEthers(); 
    
    // Debug State
    const [contractManager, setContractManager] = useState<string | null>(null);

    // Fetch the contract's stored Manager address for debugging/comparison
    useEffect(() => {
        if (isConnected && !isLoadingAuth) {
            getManagerWalletAddress().then(setContractManager);
        } else {
            setContractManager(null);
        }
    }, [isConnected, isLoadingAuth, getManagerWalletAddress]);
    
    // --- RENDER LOGIC ---

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
    
    // RENDER 1.5: Unauthorized Screen (DEBUG)
    if (isConnected && !isManager) {
        // The display now shows the identical address that is unauthorized, highlighting the Hash Mismatch issue.
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-950/20 text-white p-8">
                <div className="bg-gray-900 p-8 rounded-lg border border-red-700 max-w-lg text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied: Not Manager</h2>
                    <Separator className="bg-gray-700 mb-4" />
                    
                    <div className="text-left space-y-3 font-mono text-sm">
                         <div className="flex justify-between">
                            <span className="text-gray-400">Connected Wallet:</span>
                            <span className="text-cyan-400 break-all">{address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Contract's Manager:</span>
                            <span className="text-yellow-400 break-all">{contractManager || 'Loading...'}</span>
                        </div>
                        <Separator className="bg-gray-700 mt-4" />
                    </div>
                   
                    <p className="text-sm text-yellow-400 mt-6 mb-6 text-left">
                        **CRITICAL DEBUG:** Addresses match, but the Manager Role check failed. This confirms the **MANAGER_ROLE_HASH** is the primary issue. Ensure `MANAGER_ROLE_HASH` in `config.ts` matches the contract's actual value: **`0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08`**
                    </p>
                    <Button onClick={disconnectWallet} variant="secondary">
                        Disconnect Wallet & Restart App
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
                <div id="staff-login" className="py-20 bg-gray-950/50 flex justify-center">
                    <StaffLoginForm /> 
                </div>
            </main>
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