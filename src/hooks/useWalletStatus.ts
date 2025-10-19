// src/hooks/useWalletStatus.ts (FINAL STABILITY HOOK)

import { useEthers } from '@/context/EthersContext';
import { useManagerAuth } from './useManagerAuth'; 

/**
 * Combines useEthers and useManagerAuth hooks.
 * This is the definitive fix for the "Hooks Order" error in WalletConnectButton.tsx.
 */
const useWalletStatus = () => {
    // 1. Call all necessary hooks sequentially
    const ethersContext = useEthers();
    const managerAuth = useManagerAuth();

    // 2. Merge the results
    return {
        ...ethersContext, // isConnected, address, connectWallet, disconnectWallet, error, etc.
        ...managerAuth, // isManager, isLoadingAuth
    };
};

export default useWalletStatus;