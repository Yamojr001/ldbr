// src/App.tsx (FINALIZED with Staff Routing)

import React from 'react';
import { EthersProvider, useEthers } from './context/EthersContext'; 
import { StaffAuthProvider, useStaffAuth } from './context/StaffAuthContext'; // <-- NEW IMPORTS
import HeroSection from './components/LandingPage/HeroSection';
import FeatureGrid from './components/LandingPage/FeatureGrid';
import Header from './components/Header';
import ManagerDashboard from './pages/ManagerDashboard'; 
import SalesDashboard from './pages/SalesDashboard'; // <-- NEW IMPORT
import InventoryDashboard from './pages/InventoryDashboard'; // <-- NEW IMPORT
import { useManagerAuth } from './hooks/useManagerAuth'; 
import { Toaster } from './components/ui/toaster'; 
import StaffLoginForm from './components/Sales/StaffLoginForm'; 
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button'; 
import { Separator } from './components/ui/separator'; 

const RootView: React.FC = () => {
    // Manager Auth Check
    const { isManager, isConnected, isLoadingAuth } = useManagerAuth();
    // Staff Auth Check
    const { isAuthenticated: isStaffAuthenticated, role: staffRole } = useStaffAuth();
    
    // --- RENDER LOGIC ---

    if (isLoadingAuth) {
        // ... (loading state remains the same) ...
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

    // RENDER 3: Unauthorized Screen (If connected but NOT Manager/Staff)
    if (isConnected && !isManager) {
        // ... (Unauthorized Screen JSX remains the same) ...
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-950/20 text-white p-8">
                <div className="bg-gray-900 p-8 rounded-lg border border-red-700 max-w-lg text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied: Not Manager</h2>
                    <p className="text-sm text-yellow-400 mt-6 mb-6">You are connected but not the authorized Manager. Please use the Staff Login below or contact the Admin.</p>
                    <Button onClick={useEthers().disconnectWallet} variant="secondary">
                        Disconnect Wallet
                    </Button>
                </div>
            </div>
        );
    }


    // RENDER 4: Public Landing Page 
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
    <StaffAuthProvider> {/* <-- NEW: Staff Auth Wrapper */}
        <EthersProvider>
            <RootView /> 
            <Toaster /> 
        </EthersProvider>
    </StaffAuthProvider>
  );
};

export default App;