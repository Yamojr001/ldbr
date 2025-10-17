// src/context/EthersContext.tsx (FINAL FIX: Ethers Namespace + Debug Getter)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// FIX: Import everything as 'ethers' to resolve runtime reference errors (Interface is not defined)
import * as ethers from 'ethers'; 
import { CONTRACTS } from '@/lib/config'; 

// --- TYPES ---
export type EthersProvider = ethers.BrowserProvider;

interface EthersContextType {
    provider: EthersProvider | null;
    signer: ethers.Signer | null;
    address: string | null;
    isConnected: boolean;
    error: string | null;
    staffRegistryContract: ethers.Contract | null;
    inventoryLedgerContract: ethers.Contract | null; 
    transactionProcessorContract: ethers.Contract | null; 
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    getChainId: () => Promise<number | null>;
    getManagerWalletAddress: () => Promise<string | null>; // DEBUG: Get contract's manager
}

const EthersContext = createContext<EthersContextType | undefined>(undefined);

export const useEthers = () => {
    const context = useContext(EthersContext);
    if (context === undefined) {
        throw new Error('useEthers must be used within an EthersProvider');
    }
    return context;
};

export const EthersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [provider, setProvider] = useState<EthersProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [staffRegistryContract, setStaffRegistryContract] = useState<ethers.Contract | null>(null);
    const [inventoryLedgerContract, setInventoryLedgerContract] = useState<ethers.Contract | null>(null);
    const [transactionProcessorContract, setTransactionProcessorContract] = useState<ethers.Contract | null>(null);

    const isConnected = !!address;

    const connectWallet = useCallback(async () => {
        setError(null);
        if (typeof window.ethereum === 'undefined') {
            setError("MetaMask or a Web3 provider is not installed. Please install a wallet extension.");
            return;
        }

        try {
            const newProvider = new ethers.BrowserProvider(window.ethereum); 
            const newSigner = await newProvider.getSigner(); 
            const newAddress = await newSigner.getAddress();

            // Contract Initialization - using ethers.Contract and ethers.Interface (Fix for ABI parsing)
            const staffReg = new ethers.Contract(
                CONTRACTS.StaffRegistry.address,
                new ethers.Interface(CONTRACTS.StaffRegistry.abi as any[]), 
                newSigner 
            );
            const inventoryLedger = new ethers.Contract(
                CONTRACTS.InventoryLedger.address,
                new ethers.Interface(CONTRACTS.InventoryLedger.abi as any[]), 
                newSigner 
            );
            const transactionProcessor = new ethers.Contract(
                CONTRACTS.TransactionProcessor.address,
                new ethers.Interface(CONTRACTS.TransactionProcessor.abi as any[]), 
                newSigner 
            );

            setProvider(newProvider as EthersProvider);
            setSigner(newSigner as ethers.Signer); 
            setAddress(newAddress);
            setStaffRegistryContract(staffReg);
            setInventoryLedgerContract(inventoryLedger);
            setTransactionProcessorContract(transactionProcessor);

        } catch (err: any) {
            console.error("Connection error:", err);
            const errMsg = err.message || "Failed to connect wallet.";
            setError(errMsg.includes('rejected') ? 'Wallet connection rejected by user.' : errMsg);
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setAddress(null);
        setSigner(null);
        setProvider(null);
        setStaffRegistryContract(null);
        setInventoryLedgerContract(null);
        setTransactionProcessorContract(null);
        setError(null);
    }, []);

    const getChainId = useCallback(async (): Promise<number | null> => {
        if (!provider) return null;
        const network = await provider.getNetwork();
        return Number(network.chainId);
    }, [provider]);

    /**
     * Reads the managerWallet address directly from the deployed StaffRegistry contract.
     * Used for debugging the Manager access issue.
     */
    const getManagerWalletAddress = useCallback(async (): Promise<string | null> => {
        if (!provider || !CONTRACTS.StaffRegistry.address) return null;

        try {
            const staffRegReadOnly = new ethers.Contract(
                CONTRACTS.StaffRegistry.address,
                new ethers.Interface(CONTRACTS.StaffRegistry.abi as any[]),
                provider 
            );
            const addressResult = await staffRegReadOnly.managerWallet();
            return addressResult;
        } catch (e) {
            console.error("Failed to read managerWallet address:", e);
            return null;
        }
    }, [provider]); 


    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    connectWallet(); 
                }
            };
            const handleChainChanged = () => {
                connectWallet(); 
            };
            
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [connectWallet, disconnectWallet]);


    return (
        <EthersContext.Provider value={{ 
            provider, 
            signer, 
            address, 
            isConnected, 
            error, 
            staffRegistryContract,
            inventoryLedgerContract,
            transactionProcessorContract,
            connectWallet, 
            disconnectWallet,
            getChainId,
            getManagerWalletAddress,
        }}>
            {children}
        </EthersContext.Provider>
    );
};

declare global {
  interface Window {
    ethereum?: any;
  }
}