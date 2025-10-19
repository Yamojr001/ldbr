// src/hooks/useStaffList.ts (COMPLETE CODE)

import { useState, useEffect, useCallback } from 'react';
import { useEthers } from '@/context/EthersContext';
import * as ethers from 'ethers';
import { CONTRACTS } from '@/lib/config';
import { Interface } from 'ethers';

// Staff Account Struct (from your Solidity code)
export interface StaffAccount {
    walletAddress: string;
    username: string;
    createdAt: number;
    exists: boolean;
}

interface StaffListState {
    data: StaffAccount[];
    isLoading: boolean;
    error: string | null;
}

const useStaffList = (): StaffListState => {
    const { provider } = useEthers();
    const [state, setState] = useState<StaffListState>({
        data: [],
        isLoading: false,
        error: null,
    });
    
    // Max items to loop through (a safe ceiling)
    const MAX_STAFF_ID_TO_CHECK = 50; 

    const fetchStaff = useCallback(async () => {
        if (!provider || state.isLoading) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const fetchedStaff: StaffAccount[] = [];

        try {
            // 1. Initialize Read-Only Contract
            const staffRegistryContract = new ethers.Contract(
                CONTRACTS.StaffRegistry.address,
                new Interface(CONTRACTS.StaffRegistry.abi as any[]),
                provider
            );
            
            // 2. Loop and Fetch Each Staff Account (Inefficient due to private mapping/no counter)
            for (let id = 1; id <= MAX_STAFF_ID_TO_CHECK; id++) {
                try {
                    // getStaffAccount(uint256 staffId)
                    const result = await staffRegistryContract.getStaffAccount(id); 

                    // The result is a tuple, map it to the interface
                    const staff: StaffAccount = {
                        walletAddress: result[0],
                        username: result[1],
                        createdAt: Number(result[2]),
                        exists: result[3],
                    };

                    if (staff.exists) {
                        fetchedStaff.push(staff);
                    }

                } catch (e: any) {
                    // Stop on a contract read error that indicates the ID slot is empty
                    if (e.reason && e.reason.includes("AccountNotFound")) {
                        break; 
                    }
                    if (e.code === 'CALL_EXCEPTION' || e.code === 'BAD_DATA') {
                         // Stop on a generic network/RPC error to prevent infinite loop
                        console.warn("Stopping Staff Fetch due to RPC/CALL_EXCEPTION error:", e.message);
                        break;
                    }
                    console.error(`Error fetching staff ID ${id}:`, e);
                }
            }
            
            setState({ data: fetchedStaff, isLoading: false, error: null });

        } catch (error: any) {
            setState({ data: [], isLoading: false, error: error.message || "Failed to fetch staff list from Ledger." });
        }
    }, [provider]); 


    // Initial fetch and polling
    useEffect(() => {
        fetchStaff();
        const intervalId = setInterval(fetchStaff, 30000); // Poll every 30s
        return () => clearInterval(intervalId);
    }, [fetchStaff]);

    return state;
};

export default useStaffList;