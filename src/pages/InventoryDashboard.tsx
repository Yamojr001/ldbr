// src/pages/InventoryDashboard.tsx

import React from 'react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Package, List } from 'lucide-react';
import InventoryTable from '@/components/Inventory/InventoryTable';

const InventoryDashboard: React.FC = () => {
    const { username, logout } = useStaffAuth();

    return (
        <div className="flex min-h-screen bg-gray-950 text-white">
            {/* Sidebar (Simplified) */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-yellow-400 mb-6">Inventory Manager</h1>
                <nav className="flex-grow space-y-2">
                    <Button variant="secondary" className="w-full justify-start text-left"><List className="mr-3 h-5 w-5" /> Current Stock View</Button>
                </nav>
                <Separator className="my-4 bg-gray-800" />
                <Button variant="ghost" className="w-full justify-start text-left text-red-400 hover:bg-red-900/20" onClick={logout}>
                    <LogOut className="mr-3 h-5 w-5" /> Log Out {username}
                </Button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-6">Current Stock View</h2>
                <Separator className="mb-8 bg-gray-800" />
                
                {/* Inventory Table: isManagerView=false hides cost/profit */}
                <InventoryTable isManagerView={false} /> 
            </main>
        </div>
    );
};

export default InventoryDashboard;