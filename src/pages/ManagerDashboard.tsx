// src/pages/ManagerDashboard.tsx

import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Users, LayoutDashboard, Package, BarChart3, FileText, LogOut, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEthers } from '@/context/EthersContext'; 
import StaffCreationForm from '@/components/Manager/StaffCreationForm'; // Component to be created
import InventoryTable from '@/components/Inventory/InventoryTable';   // Component to be created
import AddItemForm from '@/components/Inventory/AddItemForm';
import { CONTRACTS } from '@/lib/config';

// Define the Sidebar Navigation Items
const navItems = [
    { name: "Dashboard Overview", icon: LayoutDashboard },
    { name: "Inventory & Items", icon: Package },
    { name: "Staff & Users", icon: Users }, 
    { name: "Sales & Analytics", icon: BarChart3 },
    { name: "Reports & Export", icon: FileText },
    { name: "Contract Debug", icon: Code },
];

const ManagerDashboard: React.FC = () => {
    const { disconnectWallet, address } = useEthers();
    const [activeTab, setActiveTab] = useState<string>('Dashboard Overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'Staff & Users':
                return (
                    <div className="space-y-8">
                        <StaffCreationForm />
                        {/* Future component: Staff Listing/Management Table */}
                    </div>
                );
            case 'Inventory & Items':
                return (
                    <div className="space-y-8">
                        {/* Manager can add items AND view the full table */}
                        <AddItemForm /> 
                        <InventoryTable isManagerView={true} />
                    </div>
                );
            case 'Sales & Analytics':
                return <h3 className="text-xl text-gray-400">Sales Analytics and Market Graphs will be displayed here.</h3>;
            case 'Reports & Export':
                return <h3 className="text-xl text-gray-400">PDF, CSV, and SQL report generation tools will be placed here.</h3>;
            case 'Contract Debug':
                return (
                    <div className="bg-gray-800 p-6 rounded-lg font-mono text-sm space-y-2">
                        <h3 className="text-lg text-cyan-400 mb-2">Debug Info</h3>
                        <p className="text-gray-300">Connected Manager: {address}</p>
                        <p className="text-gray-300">Staff Registry: {CONTRACTS.StaffRegistry.address}</p>
                        <p className="text-gray-300">Inventory Ledger: {CONTRACTS.InventoryLedger.address}</p>
                    </div>
                );
            case 'Dashboard Overview':
            default:
                return <h3 className="text-xl text-gray-400">Welcome, Manager! All key performance indicators (KPIs) and summaries will appear here.</h3>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-cyan-400 mb-6">Manager Portal</h1>
                <nav className="flex-grow space-y-2">
                    {navItems.map((item) => (
                        <Button 
                            key={item.name}
                            variant={activeTab === item.name ? "secondary" : "ghost"}
                            className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800"
                            onClick={() => setActiveTab(item.name)}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Button>
                    ))}
                </nav>
                <Separator className="my-4 bg-gray-800" />
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-red-400 hover:bg-red-900/20"
                    onClick={disconnectWallet}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Disconnect Wallet
                </Button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-6">{activeTab}</h2>
                <Separator className="mb-8 bg-gray-800" />
                
                {renderContent()}
            </main>
        </div>
    );
};

export default ManagerDashboard;