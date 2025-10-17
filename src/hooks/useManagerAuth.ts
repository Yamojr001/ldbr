// src/hooks/useManagerAuth.ts (Definitive Fixes)

import { useEthers } from '@/context/EthersContext';
import { MANAGER_ROLE_HASH, CONTRACTS } from '@/lib/config'; // Import CONTRACTS for direct hash check
import { useEffect, useState } from 'react';

interface ManagerAuth {
    isConnected: boolean;
    isManager: boolean;
    isLoadingAuth: boolean;
    managerRoleHash: string;
}

export const useManagerAuth = (): ManagerAuth => {
    const { address, isConnected, staffRegistryContract } = useEthers();
    const [isManager, setIsManager] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);

    useEffect(() => {
        // CRITICAL FIX: Only proceed if the contract object is initialized and connected
        if (!isConnected || !staffRegistryContract || !address) {
            setIsManager(false);
            setIsLoadingAuth(false);
            return; 
        }

        setIsLoadingAuth(true);

        const checkRole = async () => {
            try {
                // --- DEBUG: Validate Role Hash ---
                // Reading the MANAGER_ROLE from the contract's public variable
                const contractManagerRoleHash = await staffRegistryContract.MANAGER_ROLE();
                
                if (contractManagerRoleHash !== MANAGER_ROLE_HASH) {
                    console.error("CRITICAL ERROR: MANAGER_ROLE Hash Mismatch!");
                    console.error("Contract Hash:", contractManagerRoleHash);
                    console.error("Frontend Hash:", MANAGER_ROLE_HASH);
                    // Force unauthorized if hash is wrong to prevent silent failure
                    setIsManager(false);
                    return; 
                }
                // --- END DEBUG ---


                // Perform the actual role check (this is now safe and validated)
                const result = await staffRegistryContract.hasRole(contractManagerRoleHash, address); 
                setIsManager(result as boolean);

            } catch (err) {
                console.error("Error checking manager role (Contract Read Failure):", err);
                setIsManager(false);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        // Trigger an immediate check and start polling
        checkRole();
        const intervalId = setInterval(checkRole, 10000); 

        return () => clearInterval(intervalId);

    }, [isConnected, address, staffRegistryContract]); 


    return {
        isConnected,
        isManager,
        isLoadingAuth,
        managerRoleHash: MANAGER_ROLE_HASH,
    };
};