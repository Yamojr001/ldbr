// src/pages/SalesDashboard.tsx

import React from 'react';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, ShoppingCart, BarChart3 } from 'lucide-react';
import CheckoutTerminal from '@/components/Sales/CheckoutTerminal';

const SalesDashboard: React.FC = () => {
    const { username, logout } = useStaffAuth();

    return (
        <div className="flex min-h-screen bg-gray-950 text-white">
            {/* Sidebar (Simplified) */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-green-400 mb-6">Sales Manager</h1>
                <nav className="flex-grow space-y-2">
                    <Button variant="secondary" className="w-full justify-start text-left"><ShoppingCart className="mr-3 h-5 w-5" /> Checkout Terminal</Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800" disabled><BarChart3 className="mr-3 h-5 w-5" /> My Sales Log</Button>
                </nav>
                <Separator className="my-4 bg-gray-800" />
                <Button variant="ghost" className="w-full justify-start text-left text-red-400 hover:bg-red-900/20" onClick={logout}>
                    <LogOut className="mr-3 h-5 w-5" /> Log Out {username}
                </Button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-6">Checkout Terminal</h2>
                <Separator className="mb-8 bg-gray-800" />
                
                <CheckoutTerminal />
            </main>
        </div>
    );
};

export default SalesDashboard;