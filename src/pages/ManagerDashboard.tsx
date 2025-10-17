// src/pages/ManagerDashboard.tsx (Base Shell)

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Users, LayoutDashboard, Package, BarChart3, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEthers } from '@/context/EthersContext'; 

// Define the Sidebar Navigation Items
const navItems = [
    { name: "Dashboard Overview", icon: LayoutDashboard, href: "#overview" },
    { name: "Inventory Management", icon: Package, href: "#inventory" },
    { name: "Staff & Users", icon: Users, href: "#staff" },
    { name: "Sales & Transactions", icon: BarChart3, href: "#transactions" },
    { name: "Reports & Export", icon: FileText, href: "#reports" },
];

const ManagerDashboard: React.FC = () => {
    const { disconnectWallet } = useEthers();
    const [activeTab, setActiveTab] = React.useState<string>('Dashboard Overview');

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
            <main className="flex-1 p-8">
                <h2 className="text-3xl font-bold text-white mb-6">{activeTab}</h2>
                <Separator className="mb-8 bg-gray-800" />
                
                <p className="text-gray-400">Content for {activeTab} will be implemented here.</p>
            </main>
        </div>
    );
};

export default ManagerDashboard;