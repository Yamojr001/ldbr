// src/hooks/useManagerAuth.ts (Defensive Programming Fix)

import { useEthers } from '@/context/EthersContext';
import { MANAGER_ROLE_HASH } from '@/lib/config';
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
        // FIX: Only proceed if the contract object is initialized and connected
        if (!isConnected || !staffRegistryContract || !address) {
            setIsManager(false);
            setIsLoadingAuth(false);
            return; 
        }

        setIsLoadingAuth(true);

        const checkRole = async () => {
            try {
                // This call is now safe (prevents "hasRole is not a function")
                const result = await staffRegistryContract.hasRole(MANAGER_ROLE_HASH, address); 
                setIsManager(result as boolean);
            } catch (err) {
                console.error("Error checking manager role:", err);
                setIsManager(false);
            } finally {
                setIsLoadingAuth(false);
            }
        };

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