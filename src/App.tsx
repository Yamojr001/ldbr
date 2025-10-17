// src/App.tsx

import React from 'react';
import { EthersProvider } from '@/context/EthersContext';
import HeroSection from './components/LandingPage/HeroSection';
import FeatureGrid from './components/LandingPage/FeatureGrid';
import Header from './components/Header';
import ManagerDashboard from './pages/ManagerDashboard'; 
import { useManagerAuth } from './hooks/useManagerAuth'; 
import { Toaster } from './components/ui/toaster'; 
import StaffLoginForm from './components/Sales/StaffLoginForm'; // NEW IMPORT
import { Loader2 } from 'lucide-react';

const RootView: React.FC = () => {
    const { isManager, isConnected, isLoadingAuth } = useManagerAuth();

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
    
    // RENDER 1: Manager Dashboard (Web3 Wallet Authenticated)
    if (isConnected && isManager) {
        return <ManagerDashboard />;
    }

    // RENDER 2: Public Landing Page / Staff Login
    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <Header />
            <main>
                <HeroSection />
                <FeatureGrid />
                {/* Staff Login Area */}
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