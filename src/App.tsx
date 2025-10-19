// src/App.tsx (FINAL CODE - Corrected UX for Unauthorized Access)

import React from 'react';
import { EthersProvider, useEthers } from './context/EthersContext'; 
import { StaffAuthProvider, useStaffAuth } from './context/StaffAuthContext'; 
import HeroSection from './components/LandingPage/HeroSection';
import FeatureGrid from './components/LandingPage/FeatureGrid';
import Header from './components/Header';
import ManagerDashboard from './pages/ManagerDashboard'; 
import SalesDashboard from './pages/SalesDashboard'; 
import InventoryDashboard from './pages/InventoryDashboard'; 
import ContractDebug from './components/Dashboard/ContractDebug'; // For Debug Mode
import { useManagerAuth } from './hooks/useManagerAuth'; 
import { Toaster } from './components/ui/toaster'; 
import StaffLoginForm from './components/Sales/StaffLoginForm'; 
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button'; 
import { Separator } from './components/ui/separator'; 

const RootView: React.FC = () => {
    // Hooks
    const { isManager, isConnected, isLoadingAuth, address } = useManagerAuth();
    const { isAuthenticated: isStaffAuthenticated, role: staffRole } = useStaffAuth();
    const { disconnectWallet } = useEthers();
    
    // --- RENDER LOGIC ---

    // 0. EMERGENCY DEBUG ROUTE (Manual URL bypass: http://localhost:5173/?debug=true)
    const isDebugMode = window.location.search.includes('debug=true');
    if (isDebugMode) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <main className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-6">EMERGENCY CONTRACT DEBUG MODE</h2>
                    <p className="text-sm text-yellow-400 mb-6">This view bypasses all role checks to diagnose critical contract connectivity issues. <a href="/" className="underline ml-2">Click here to exit.</a></p>
                    <ContractDebug />
                </main>
            </div>
        );
    }


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
    
    // RENDER 1: Staff Dashboards (Highest Priority after Manager)
    if (isStaffAuthenticated) {
        if (staffRole === 'Sales Manager') {
            return <SalesDashboard />;
        }
        if (staffRole === 'Inventory Manager') {
            return <InventoryDashboard />;
        }
    }
    
    // RENDER 2: Manager Dashboard
    if (isConnected && isManager) {
        return <ManagerDashboard />;
    }

    // RENDER 3: The Landing Page (Acknowledging Connection Status)
    let connectionStatusBox = null;
    if (isConnected && !isManager) {
        // FIX: Simple Status Box without the massive debugger 
        // connectionStatusBox = (
        //     <div className="text-center mb-6 p-4 border border-yellow-700 bg-yellow-900/20 rounded-lg max-w-sm mx-auto">
        //         {/* <h3 className="text-xl font-bold text-yellow-400">Wallet Connected</h3>
        //         <p className="text-gray-300 text-sm mt-2">
        //             Your wallet is connected but does **not** have Manager privileges. 
        //         </p>
        //         <Separator className="my-3 bg-gray-700" />
        //         <Button onClick={disconnectWallet} variant="secondary" className="mr-4 h-8">Disconnect</Button> */}
        //         {/* FIX: Link to activate the debug mode */}
        //         <a href={window.location.href + '?debug=true'} className="text-sm text-cyan-400 hover:text-cyan-300 underline">
        //             Run Diagnostic
        //         </a>
        //     </div>
        // );
    }


    // RENDER 4: Public Landing Page (Final Output)
    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <Header />
            <main>
                <HeroSection />
                <FeatureGrid />
                <div id="staff-login" className="py-20 bg-gray-950/50 flex flex-col items-center">
                    {connectionStatusBox} 
                    <StaffLoginForm /> 
                </div>
            </main>
        </div>
    );
}

const App: React.FC = () => {
  return (
    <StaffAuthProvider>
        <EthersProvider>
            <RootView /> 
            <Toaster /> 
        </EthersProvider>
    </StaffAuthProvider>
  );
};

export default App;