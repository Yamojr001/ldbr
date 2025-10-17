// src/components/Inventory/InventoryTable.tsx (FINAL CODE)

import React, { useState, useEffect, useCallback } from 'react';
import { useEthers } from '@/context/EthersContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Loader2, Unlock, AlertTriangle } from 'lucide-react';
import { decryptData } from '@/lib/crypto';
import * as ethers from 'ethers'; // FIX: Import everything as ethers
import { CONTRACTS } from '@/lib/config';

// Decrypted Item Structure
interface ItemData {
    name: string;
    category: string;
    actualPrice: number; 
    sellingPrice: number; 
}

interface DecryptedItem extends ItemData {
    recordId: number;
    currentStock: number;
    totalSold: number;
    profit: number; // Calculated front-end profit
}

interface InventoryTableProps {
    isManagerView: boolean; 
}

const InventoryTable: React.FC<InventoryTableProps> = ({ isManagerView }) => {
    const { provider } = useEthers();
    const [inventory, setInventory] = useState<DecryptedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // This is an estimate since the contract doesn't expose a public counter
    const MAX_ITEM_ID_TO_CHECK = 50; 

    const fetchInventory = useCallback(async () => {
        if (!provider) return;
        
        setIsLoading(true);
        setLoadError(null);
        const fetchedItems: DecryptedItem[] = [];

        try {
            // 1. Get Inventory Ledger Contract instance (read-only with provider)
            const inventoryLedgerContract = new ethers.Contract( // FIX: Use ethers.Contract
                CONTRACTS.InventoryLedger.address,
                new ethers.Interface(CONTRACTS.InventoryLedger.abi as any[]), // FIX: Use ethers.Interface
                provider
            );
            
            // 2. Loop and Fetch Each Item
            for (let id = 1; id <= MAX_ITEM_ID_TO_CHECK; id++) {
                try {
                    // getItemData returns (encryptedData, currentStock, totalSold)
                    const [encryptedData, currentStockBigInt, totalSoldBigInt] = await inventoryLedgerContract.getItemData(id); 

                    if (encryptedData === "") continue;

                    // 3. Decrypt the Data (Core Requirement)
                    const plaintextString = decryptData(encryptedData);
                    const itemData: ItemData = JSON.parse(plaintextString);

                    // 4. Calculate Profit
                    const stock = Number(currentStockBigInt);
                    const sold = Number(totalSoldBigInt);
                    const profitPerItem = itemData.sellingPrice - itemData.actualPrice;
                    const totalProfit = profitPerItem * sold;

                    fetchedItems.push({
                        recordId: id,
                        currentStock: stock,
                        totalSold: sold,
                        profit: totalProfit,
                        ...itemData,
                    });

                } catch (e: any) {
                    if (e.reason && e.reason.includes("Item does not exist")) {
                        break; 
                    }
                    console.error(`Error fetching/decrypting item ${id}:`, e);
                }
            }
            
            setInventory(fetchedItems);

        } catch (error: any) {
            setLoadError(error.message || "Failed to fetch inventory data. Check network and contract addresses.");
        } finally {
            setIsLoading(false);
        }
    }, [provider]); 


    // Initial fetch and polling
    useEffect(() => {
        fetchInventory();
        const intervalId = setInterval(fetchInventory, 30000); // Poll every 30s
        return () => clearInterval(intervalId);
    }, [fetchInventory]);

    return (
        <Card className="bg-gray-800 border-gray-700 w-full">
            <CardHeader>
                <CardTitle className="text-white flex items-center">
                    <Unlock className="mr-2 h-5 w-5 text-green-400" />
                    Encrypted Inventory Records (Decrypted View)
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Showing {inventory.length} active item records. Data is verified from BlockDAG and decrypted client-side.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadError && (
                    <div className="flex items-center text-red-400 p-4 border border-red-700 rounded-lg mb-4">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        <p>{loadError}</p>
                    </div>
                )}
                
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-cyan-400" />
                        <p className="text-gray-400">Loading and decrypting {MAX_ITEM_ID_TO_CHECK} potential records...</p>
                    </div>
                )}

                {!isLoading && inventory.length > 0 && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-gray-800">
                                    <TableHead className="w-[50px]">ID</TableHead>
                                    <TableHead>Name/Category</TableHead>
                                    {isManagerView && <TableHead className="text-right">Cost Price</TableHead>}
                                    <TableHead className="text-right">Selling Price</TableHead>
                                    <TableHead className="text-right">Current Stock</TableHead>
                                    <TableHead className="text-right">Total Sold</TableHead>
                                    {isManagerView && <TableHead className="text-right font-bold text-green-400">Total Profit</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.map((item) => (
                                    <TableRow key={item.recordId} className="hover:bg-gray-700/50 border-gray-700">
                                        <TableCell className="font-medium text-cyan-400">{item.recordId}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-white">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.category}</div>
                                        </TableCell>
                                        {isManagerView && <TableCell className="text-right text-yellow-400">${item.actualPrice.toFixed(2)}</TableCell>}
                                        <TableCell className="text-right">${item.sellingPrice.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-semibold">{item.currentStock}</TableCell>
                                        <TableCell className="text-right">{item.totalSold}</TableCell>
                                        {isManagerView && <TableCell className="text-right font-bold text-green-400">${item.profit.toFixed(2)}</TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default InventoryTable;
