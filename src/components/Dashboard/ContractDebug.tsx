// src/components/Dashboard/ContractDebug.tsx (FINAL CODE with Display Fix)

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useEthers } from '@/context/EthersContext';
import useStaffList from '@/hooks/useStaffList'; 
import { MANAGER_ROLE_HASH, STAFF_ROLE_HASH, CONTRACTS } from '@/lib/config';
import { isAddress } from 'ethers'; // Import isAddress
import * as ethers from 'ethers'; // For ethers.ZeroAddress

// --- TYPES ---
interface UserRoleStatus {
    address: string;
    isManager: boolean;
    isStaff: boolean;
    isDeployedManager: boolean; 
}

interface DebugState {
    contractManagerWallet: string | null;
    contractManagerRoleHash: string | null;
    contractStaffRoleHash: string | null;
    contractAdminHash: string | null;
    userStatus: UserRoleStatus | null;
    isLoaded: boolean;
}
// --- END TYPES ---


const ContractDebug: React.FC = () => {
    const { provider, address, staffRegistryContract, getDefaultAdminRoleHash, getManagerWalletAddress } = useEthers();
    const staffListState = useStaffList(); 

    const [debugState, setDebugState] = useState<DebugState>({
        contractManagerWallet: null, contractManagerRoleHash: null, contractStaffRoleHash: null,
        contractAdminHash: null, userStatus: null, isLoaded: false,
    });

    const runDebugChecks = useCallback(async () => {
        if (!provider || !staffRegistryContract || !address) return;

        try {
            // 1. Get Manager Wallet Address (using the safe getter from EthersContext)
            const managerWallet = await getManagerWalletAddress();

            // 2. Get Hashes (These are the ones failing with BAD_DATA)
            // We use the raw contract method and assume EthersContext's resilient read wrapper is in use.
            const contractManagerHash = await staffRegistryContract.MANAGER_ROLE();
            const staffRoleHashFromContract = await staffRegistryContract.STAFF_ROLE();
            const contractAdminHash = await getDefaultAdminRoleHash();

            // 3. Connected User's Specific Status
            const isManager = await staffRegistryContract.hasRole(contractManagerHash, address);
            const isStaff = await staffRegistryContract.hasRole(staffRoleHashFromContract, address);

            setDebugState({
                contractManagerWallet: managerWallet,
                contractManagerRoleHash: contractManagerHash,
                contractStaffRoleHash: staffRoleHashFromContract,
                contractAdminHash: contractAdminHash,
                userStatus: { address: address, isManager, isStaff, isDeployedManager: managerWallet?.toLowerCase() === address.toLowerCase() },
                isLoaded: true,
            });

        } catch (e) {
            console.error("Debug Check Failed (Network/RPC Error):", e);
            // Set state to show that the check failed but the component loaded
            setDebugState(prev => ({ ...prev, isLoaded: true }));
        }
    }, [provider, staffRegistryContract, address, getDefaultAdminRoleHash, getManagerWalletAddress]);


    useEffect(() => {
        runDebugChecks();
        const interval = setInterval(runDebugChecks, 10000); 
        return () => clearInterval(interval);
    }, [runDebugChecks]);


    // --- RENDER LOGIC ---
    const checkIcon = (status: boolean) => status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
    
    // Helper function to render Hash Status
    const renderHashStatus = (contractHash: string | null, frontendHash: string, name: string) => {
        if (!contractHash) {
             return <p className="text-red-400 break-all">RPC READ FAILURE: Could not retrieve {name} from contract.</p>;
        }
        const isMatch = contractHash === frontendHash;
        return (
            <>
                <p className="text-gray-400">Frontend (`config.ts`): <span className="text-white break-all">{frontendHash}</span></p>
                <p className="text-gray-400">Contract (`{name}():`): <span className={isMatch ? "text-yellow-400 break-all" : "text-red-400 break-all"}>{contractHash}</span></p>
                <div className="mt-2 flex items-center">
                    {checkIcon(isMatch)} 
                    <span className={isMatch ? "ml-2 font-bold text-green-400" : "ml-2 font-bold text-red-400"}>
                        {name} HASH {isMatch ? 'MATCH' : 'MISMATCH'}
                    </span>
                </div>
            </>
        );
    };

    const user = debugState.userStatus; 

    if (!debugState.isLoaded || staffListState.isLoading) {
        return (
            <Card className="bg-gray-800 border-gray-700 p-6 flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="text-gray-400">Performing on-chain role verification and fetching staff list...</span>
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
                
                {/* 1. CONNECTED WALLET & ROLE STATUS */}
                <h3 className="text-xl font-semibold text-white">1. Connected Wallet & Role Status</h3>
                <div className="font-mono text-sm space-y-2">
                    <p className="p-2 bg-gray-900/50 rounded-lg text-gray-400">Connected Wallet: <span className="text-white break-all">{user?.address}</span></p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-lg">{checkIcon(user?.isManager || false)} <span className="ml-2 text-lg">MANAGER ROLE</span></div>
                        <div className="flex items-center text-lg">{checkIcon(user?.isStaff || false)} <span className="ml-2">STAFF ROLE</span></div>
                    </div>
                </div>
                
                <Separator className="bg-gray-700" />

                {/* 2. CORE CONTRACT CONSTANTS (THE SOURCE OF TRUTH) */}
                <h3 className="text-xl font-semibold text-white">2. Contract Source of Truth</h3>
                <div className="space-y-4 font-mono text-sm">
                    
                    {/* DEPLOYED MANAGER ADDRESS */}
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-lg mb-1 text-cyan-300">DEPLOYED MANAGER ADDRESS</p>
                        <p className="text-gray-400">Contract's `managerWallet`:</p>
                        <p className="text-green-400 break-all">{debugState.contractManagerWallet || 'RPC READ FAILURE'}</p>
                        <p className="mt-2 text-gray-400">Connected Wallet Match:</p>
                        <div className="flex items-center">
                            {checkIcon(debugState.contractManagerWallet?.toLowerCase() === user?.address.toLowerCase())} 
                            <span className="ml-2 font-bold text-lg">ADDRESS MATCH CHECK</span>
                        </div>
                    </div>

                    {/* MANAGER ROLE HASH CHECK */}
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-lg mb-1 text-cyan-300">MANAGER_ROLE HASH</p>
                        {renderHashStatus(debugState.contractManagerRoleHash, MANAGER_ROLE_HASH, "MANAGER_ROLE")}
                    </div>
                    
                    {/* STAFF ROLE HASH CHECK */}
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-lg mb-1 text-cyan-300">STAFF_ROLE HASH</p>
                        {renderHashStatus(debugState.contractStaffRoleHash, STAFF_ROLE_HASH, "STAFF_ROLE")}
                    </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* 3. REGISTERED STAFF LIST */}
                <h3 className="text-xl font-semibold text-white">3. Registered Staff Accounts ({staffListState.data.length})</h3>
                {staffListState.error && <p className="p-2 bg-red-900/30 text-red-400 text-sm">{staffListState.error}</p>}
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {staffListState.data.map((staff, index) => (
                        <div key={index} className="p-3 bg-gray-900/50 rounded-lg text-sm flex justify-between items-center">
                            <span className="text-cyan-300 font-semibold">{staff.username}</span>
                            <span className="font-mono text-gray-400 break-all ml-4">
                                {staff.walletAddress} 
                            </span>
                        </div>
                    ))}
                    {staffListState.data.length === 0 && <p className="text-gray-500">No staff accounts found. Manager must create them.</p>}
                </div>

            </CardContent>
        </Card>
    );
};

export default ContractDebug;