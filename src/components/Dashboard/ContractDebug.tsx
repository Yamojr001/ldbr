// src/components/Dashboard/ContractDebug.tsx (FINAL, CORRECT CODE)

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useEthers } from '@/context/EthersContext';
import { MANAGER_ROLE_HASH, STAFF_ROLE_HASH, CONTRACTS } from '@/lib/config';
// Note: Ethers is not imported directly here; it's pulled from useEthers() for types

// --- TYPES ---
interface DebugState {
    contractManagerWallet: string | null;
    contractManagerRoleHash: string | null;
    contractStaffRoleHash: string | null;
    contractAdminHash: string | null;
    isManagerConnected: boolean;
    isStaffConnected: boolean;
    isLoaded: boolean;
}

const ContractDebug: React.FC = () => {
    const { 
        provider, 
        address, 
        staffRegistryContract, 
        getDefaultAdminRoleHash, 
        getManagerWalletAddress 
    } = useEthers();
    
    const [debugState, setDebugState] = useState<DebugState>({
        contractManagerWallet: null,
        contractManagerRoleHash: null,
        contractStaffRoleHash: null,
        contractAdminHash: null,
        isManagerConnected: false,
        isStaffConnected: false,
        isLoaded: false,
    });

    const runDebugChecks = useCallback(async () => {
        if (!provider || !staffRegistryContract || !address) return;

        try {
            // 1. Get Manager Wallet Address (from public variable)
            const managerWallet = await getManagerWalletAddress();

            // 2. Get Manager and Staff Role Hashes directly from the contract
            const managerRoleHashFromContract = await staffRegistryContract.MANAGER_ROLE();
            const staffRoleHashFromContract = await staffRegistryContract.STAFF_ROLE();

            // 3. Get Role Status for connected address
            const isManager = await staffRegistryContract.hasRole(managerRoleHashFromContract, address);
            const isStaff = await staffRegistryContract.hasRole(staffRoleHashFromContract, address);
            
            // 4. Get Default Admin Role Hash (for ultimate verification)
            const contractAdminHash = await getDefaultAdminRoleHash();
            
            setDebugState({
                contractManagerWallet: managerWallet,
                contractManagerRoleHash: managerRoleHashFromContract,
                contractStaffRoleHash: staffRoleHashFromContract,
                contractAdminHash: contractAdminHash,
                isManagerConnected: isManager,
                isStaffConnected: isStaff,
                isLoaded: true,
            });

        } catch (e) {
            console.error("Debug Check Failed (Contract Read Error):", e);
            setDebugState(prev => ({ ...prev, isLoaded: true }));
        }
    }, [provider, staffRegistryContract, address, getDefaultAdminRoleHash, getManagerWalletAddress]);


    useEffect(() => {
        runDebugChecks();
        const interval = setInterval(runDebugChecks, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [runDebugChecks]);


    // --- Helper Functions for Rendering ---
    const checkIcon = (status: boolean) => status 
        ? <CheckCircle className="h-5 w-5 text-green-500" /> 
        : <XCircle className="h-5 w-5 text-red-500" />;
        
    const managerHashMatch = debugState.contractManagerRoleHash === MANAGER_ROLE_HASH;

    if (!debugState.isLoaded) {
        return (
            <Card className="bg-gray-800 border-gray-700 p-6 flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="text-gray-400">Performing on-chain role verification...</span>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800 border-gray-700 w-full shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl text-cyan-400">Contract State Debugger</CardTitle>
                <CardDescription className="text-gray-400">Final role and address verification against deployed contract `{CONTRACTS.StaffRegistry.address.slice(0, 8)}...`</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <h3 className="text-xl font-semibold text-white">1. Connected Wallet & Role Status</h3>
                <div className="font-mono text-sm space-y-2">
                    <div className="p-2 bg-gray-900/50 rounded-lg">
                        <p className="text-gray-400">Connected Wallet:</p>
                        <p className="text-white break-all">{address}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-lg">{checkIcon(debugState.isManagerConnected)} <span className="ml-2 text-lg">MANAGER ROLE</span></div>
                        <div className="flex items-center text-lg">{checkIcon(debugState.isStaffConnected)} <span className="ml-2">STAFF ROLE</span></div>
                    </div>
                </div>
                
                <Separator className="bg-gray-700" />

                <h3 className="text-xl font-semibold text-white">2. Role Hash & Address Verification</h3>
                <div className="space-y-4 font-mono text-sm">
                    {/* MANAGER ROLE HASH CHECK */}
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-lg mb-1 text-cyan-300">MANAGER_ROLE HASH</p>
                        <div className="space-y-1">
                            <p className="text-gray-400">Frontend (`config.ts`): <span className="text-white break-all">{MANAGER_ROLE_HASH}</span></p>
                            <p className="text-gray-400">Contract (`MANAGER_ROLE()`): <span className="text-yellow-400 break-all">{debugState.contractManagerRoleHash}</span></p>
                            <div className="mt-2 flex items-center">
                                {checkIcon(managerHashMatch)} 
                                <span className={managerHashMatch ? "ml-2 font-bold text-green-400" : "ml-2 font-bold text-red-400"}>
                                    {managerHashMatch ? "MATCH: HASH is correct." : "MISMATCH: Critical Failure."}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* MANAGER WALLET CHECK */}
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-lg mb-1 text-cyan-300">MANAGER WALLET ADDRESS</p>
                        <p className="text-gray-400">Connected Wallet: <span className="text-white break-all">{address}</span></p>
                        <p className="text-gray-400">Contract's Manager: <span className="text-green-400 break-all">{debugState.contractManagerWallet}</span></p>
                        <div className="mt-2 flex items-center">
                            {checkIcon(debugState.contractManagerWallet?.toLowerCase() === address?.toLowerCase())} 
                            <span className="ml-2 font-bold text-lg">Contract Manager Address Match!</span>
                        </div>
                    </div>

                    {/* ADMIN HASH CHECK */}
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-lg mb-1 text-cyan-300">DEFAULT_ADMIN_ROLE HASH</p>
                         <p className="text-gray-400">Contract (`DEFAULT_ADMIN_ROLE()`): <span className="text-yellow-400 break-all">{debugState.contractAdminHash}</span></p>
                         <p className="text-gray-400">Frontend Check (Default OZ): <span className="text-white break-all">0x0000000000000000000000000000000000000000000000000000000000000000</span></p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default ContractDebug;