// src/hooks/useManagerAuth.ts

import { useEthers } from '@/context/EthersContext';
import { MANAGER_ROLE_HASH } from '@/lib/config';
import { useEffect, useState } from 'react';

interface ManagerAuth {
    isConnected: boolean;
    isManager: boolean;
    isLoadingAuth: boolean;
    managerRoleHash: string;
}

/**
 * Custom hook to check if the connected wallet is the Manager (Admin).
 * Relies on the StaffRegistry contract's hasRole function.
 */
export const useManagerAuth = (): ManagerAuth => {
    // Get wallet and contract instance from Ethers context
    const { address, isConnected, staffRegistryContract } = useEthers();
    const [isManager, setIsManager] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);

    useEffect(() => {
        // Only proceed if connected and contract is loaded
        if (!isConnected || !staffRegistryContract || !address) {
            setIsManager(false);
            setIsLoadingAuth(false);
            return;
        }

        setIsLoadingAuth(true);

        const checkRole = async () => {
            try {
                // Ethers v6 Contract Read: hasRole(bytes32 role, address account)
                const result = await staffRegistryContract.hasRole(MANAGER_ROLE_HASH, address);
                // Contract returns boolean in this OpenZeppelin structure
                setIsManager(result as boolean); 
            } catch (err) {
                console.error("Error checking manager role:", err);
                setIsManager(false);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        checkRole();
        
        // Polling logic: Periodically check the role status (every 10 seconds)
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