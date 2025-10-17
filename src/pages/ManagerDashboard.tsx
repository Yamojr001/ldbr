// src/pages/ManagerDashboard.tsx (FINAL CODE)

import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Users, LayoutDashboard, Package, BarChart3, FileText, LogOut, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEthers } from '@/context/EthersContext'; 
import StaffCreationForm from '@/components/Manager/StaffCreationForm'; 
import AddItemForm from '@/components/Inventory/AddItemForm'; 
import InventoryTable from '@/components/Inventory/InventoryTable';   
import OverviewCharts from '@/components/Dashboard/OverviewCharts'; 
import ContractDebug from '@/components/Dashboard/ContractDebug'; // <-- ADDED
import { CONTRACTS } from '@/lib/config';

// Define the Sidebar Navigation Items
const navItems = [
    { name: "Dashboard Overview", icon: LayoutDashboard },
    { name: "Inventory & Items", icon: Package },
    { name: "Staff & Users", icon: Users }, 
    { name: "Sales & Analytics", icon: BarChart3 },
    { name: "Reports & Export", icon: FileText },
    { name: "Contract Debug", icon: Code }, // <-- ADDED DEBUG TAB
];

const ManagerDashboard: React.FC = () => {
    const { disconnectWallet, address } = useEthers();
    const [activeTab, setActiveTab] = useState<string>('Dashboard Overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard Overview': 
                return <OverviewCharts />;
            case 'Staff & Users':
                return (
                    <div className="space-y-8">
                        <StaffCreationForm />
                        <p className="text-gray-400">...Staff listing table goes here...</p>
                    </div>
                );
            case 'Inventory & Items':
                return (
                    <div className="space-y-8">
                        <AddItemForm /> 
                        <InventoryTable isManagerView={true} />
                    </div>
                );
            case 'Sales & Analytics':
                return <OverviewCharts />; // Re-use charts component
            case 'Reports & Export':
                return <h3 className="text-xl text-gray-400">PDF, CSV, and SQL report generation tools will be placed here.</h3>;
            case 'Contract Debug': // <-- DEBUG CASE IMPLEMENTED
                return <ContractDebug />; 
            default:
                return <h3 className="text-xl text-gray-400">Content not found.</h3>;
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