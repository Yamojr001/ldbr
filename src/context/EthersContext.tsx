// src/context/EthersContext.tsx (FINAL FIX APPLIED + Debug Getter)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, Signer, Interface } from 'ethers'; 
import { CONTRACTS } from '@/lib/config'; 

// --- TYPES ---
export type EthersProvider = BrowserProvider;

interface EthersContextType {
    provider: EthersProvider | null;
    signer: Signer | null;
    address: string | null;
    isConnected: boolean;
    error: string | null;
    staffRegistryContract: Contract | null;
    inventoryLedgerContract: Contract | null; 
    transactionProcessorContract: Contract | null; 
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    getChainId: () => Promise<number | null>;
    getManagerWalletAddress: () => Promise<string | null>;
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
    const [signer, setSigner] = useState<Signer | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [staffRegistryContract, setStaffRegistryContract] = useState<Contract | null>(null);
    const [inventoryLedgerContract, setInventoryLedgerContract] = useState<Contract | null>(null);
    const [transactionProcessorContract, setTransactionProcessorContract] = useState<Contract | null>(null);

    const isConnected = !!address;

    const connectWallet = useCallback(async () => {
        setError(null);
        if (typeof window.ethereum === 'undefined') {
            setError("MetaMask or a Web3 provider is not installed. Please install a wallet extension.");
            return;
        }

        try {
            const newProvider = new BrowserProvider(window.ethereum); 
            const newSigner = await newProvider.getSigner(); 
            const newAddress = await newSigner.getAddress();

            // Contract Initialization (FIXED: Interface parsing)
            const staffReg = new Contract(
                CONTRACTS.StaffRegistry.address,
                new Interface(CONTRACTS.StaffRegistry.abi as any[]), 
                newSigner 
            );
            const inventoryLedger = new Contract(
                CONTRACTS.InventoryLedger.address,
                new Interface(CONTRACTS.InventoryLedger.abi as any[]), 
                newSigner 
            );
            const transactionProcessor = new Contract(
                CONTRACTS.TransactionProcessor.address,
                new Interface(CONTRACTS.TransactionProcessor.abi as any[]), 
                newSigner 
            );

            setProvider(newProvider as EthersProvider);
            setSigner(newSigner as Signer); 
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
     */
    const getManagerWalletAddress = useCallback(async (): Promise<string | null> => {
        if (!provider || !CONTRACTS.StaffRegistry.address) return null;

        try {
            const staffRegReadOnly = new Contract(
                CONTRACTS.StaffRegistry.address,
                new Interface(CONTRACTS.StaffRegistry.abi as any[]),
                provider 
            );
            // managerWallet is a public state variable getter
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