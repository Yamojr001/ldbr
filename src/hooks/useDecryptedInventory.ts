// src/hooks/useDecryptedInventory.ts

import { useState, useEffect, useCallback } from 'react';
import { useEthers } from '@/context/EthersContext';
import * as ethers from 'ethers';
import { CONTRACTS } from '@/lib/config';
import { decryptData } from '@/lib/crypto';
import { Interface } from 'ethers';

// Decrypted Item Structure (must include costPrice for profit calculation)
export interface InventoryItem {
    recordId: number;
    name: string;
    category: string;
    actualPrice: number; // Cost Price
    sellingPrice: number; 
    currentStock: number;
    totalSold: number;
}

interface InventoryState {
    data: InventoryItem[];
    isLoading: boolean;
    error: string | null;
}

const useDecryptedInventory = (): InventoryState => {
    const { provider } = useEthers();
    const [state, setState] = useState<InventoryState>({
        data: [],
        isLoading: false,
        error: null,
    });
    
    // Max items to loop through (must be set high enough to cover all items)
    const MAX_ITEM_ID_TO_CHECK = 100; 

    const fetchInventory = useCallback(async () => {
        if (!provider || state.isLoading) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const fetchedItems: InventoryItem[] = [];

        try {
            // 1. Initialize Read-Only Contract
            const inventoryLedgerContract = new ethers.Contract(
                CONTRACTS.InventoryLedger.address,
                new Interface(CONTRACTS.InventoryLedger.abi as any[]),
                provider
            );
            
            // 2. Loop and Fetch Each Item
            for (let id = 1; id <= MAX_ITEM_ID_TO_CHECK; id++) {
                try {
                    // getItemData returns (encryptedData, currentStock, totalSold)
                    const [encryptedData, currentStockBigInt, totalSoldBigInt] = await inventoryLedgerContract.getItemData(id); 

                    if (encryptedData === "") continue;

                    // 3. Decrypt the Data
                    const plaintextString = decryptData(encryptedData);
                    const itemData: ItemItemData = JSON.parse(plaintextString); // Assuming ItemData structure from previous steps

                    // 4. Aggregate
                    fetchedItems.push({
                        recordId: id,
                        currentStock: Number(currentStockBigInt),
                        totalSold: Number(totalSoldBigInt),
                        ...itemData,
                    });

                } catch (e: any) {
                    if (e.reason && e.reason.includes("Item does not exist")) {
                        break; 
                    }
                    console.error(`Error fetching/decrypting item ${id}:`, e);
                }
            }
            
            setState({ data: fetchedItems.filter(item => item.currentStock > 0), isLoading: false, error: null });

        } catch (error: any) {
            setState({ data: [], isLoading: false, error: error.message || "Failed to fetch inventory from Ledger." });
        }
    }, [provider]); 


    // Initial fetch and polling
    useEffect(() => {
        fetchInventory();
        const intervalId = setInterval(fetchInventory, 30000); // Poll every 30s
        return () => clearInterval(intervalId);
    }, [fetchInventory]);

    return state;
};

export default useDecryptedInventory;