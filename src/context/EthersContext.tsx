// src/context/EthersContext.tsx (FINAL, BUG-FIXED Ethers v6 Code)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Ethers v6 Imports: BrowserProvider connects to MetaMask
import { BrowserProvider, Contract, Signer } from 'ethers'; 
import { CONTRACTS } from '@/lib/config'; // Contract addresses and ABIs

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
            // Ethers v6 FIX: Use BrowserProvider and pass the raw provider object
            const newProvider = new BrowserProvider(window.ethereum); 
            
            // This triggers the real MetaMask connection and selection pop-up
            const newSigner = await newProvider.getSigner(); 
            const newAddress = await newSigner.getAddress();

            // Initialize Contracts with the connected signer (for WRITE operations)
            const staffReg = new Contract(
                CONTRACTS.StaffRegistry.address,
                CONTRACTS.StaffRegistry.abi as any[], 
                newSigner 
            );
            const inventoryLedger = new Contract(
                CONTRACTS.InventoryLedger.address,
                CONTRACTS.InventoryLedger.abi as any[], 
                newSigner 
            );
            const transactionProcessor = new Contract(
                CONTRACTS.TransactionProcessor.address,
                CONTRACTS.TransactionProcessor.abi as any[], 
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


    // Effect to handle account/chain changes
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
            
            // Note: Keep the MetaMask event listeners on window.ethereum
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
            getChainId
        }}>
            {children}
        </EthersContext.Provider>
    );
};

// Extend the Window interface to include Ethereum provider for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}