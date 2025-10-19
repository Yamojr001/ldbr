// src/hooks/useManagerAuth.ts (FINAL RESILIENT CODE)

import { useEthers } from '@/context/EthersContext';
import { MANAGER_ROLE_HASH } from '@/lib/config';
import { useEffect, useState } from 'react';
import useResilientRead from './useResilientRead'; // Assumes useResilientRead.ts exists

// --- INTERFACES (omitted in snippet, but required) ---
interface ManagerAuth {
    isConnected: boolean;
    isManager: boolean;
    isLoadingAuth: boolean;
    managerRoleHash: string;
}
// --- END INTERFACES ---


export const useManagerAuth = (): ManagerAuth => {
    const { address, isConnected, staffRegistryContract } = useEthers();
    const [isManager, setIsManager] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const resilientRead = useResilientRead(); 

    useEffect(() => {
        if (!isConnected || !staffRegistryContract || !address) {
            setIsManager(false);
            setIsLoadingAuth(false);
            return; 
        }

        setIsLoadingAuth(true);

        const checkRole = async () => {
            try {
                // Step 1: Resilient HASH VALIDATION
                const contractManagerRoleHash = await resilientRead(() => 
                    staffRegistryContract.MANAGER_ROLE()
                );
                
                if (contractManagerRoleHash !== MANAGER_ROLE_HASH) {
                    console.error("❌ CRITICAL ERROR: MANAGER_ROLE Hash Mismatch!", { Contract: contractManagerRoleHash, Frontend: MANAGER_ROLE_HASH });
                    setIsManager(false);
                    return; 
                }
                
                // Step 2: Resilient FINAL ROLE CHECK
                const result = await resilientRead(() => 
                    staffRegistryContract.hasRole(contractManagerRoleHash, address)
                );
                
                setIsManager(result as boolean);

            } catch (err: any) {
                // --- DEBUG LOGGING ---
                console.groupCollapsed("🔴 ERROR: Manager Role Check Failed - Full Details");
                console.error("RAW ERROR OBJECT:", err); 
                console.error("DIAGNOSIS: Resilient Read Failed. (Persistent network issue or final code revert.)");
                console.groupEnd();

                setIsManager(false); 

            } finally {
                setIsLoadingAuth(false);
            }
        };

        checkRole();
        const interval = setInterval(checkRole, 10000); 
        return () => clearInterval(interval);

    }, [isConnected, address, staffRegistryContract, resilientRead]);


    return {
        isConnected,
        isManager,
        isLoadingAuth,
        managerRoleHash: MANAGER_ROLE_HASH,
    };
};