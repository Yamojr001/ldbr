// src/components/Sales/StaffLoginForm.tsx (FINAL CODE with EXTREME DEBUG)

import React, { useState, useEffect } from 'react';
import { useEthers } from '@/context/EthersContext';
import { useStaffAuth, StaffRole } from '@/context/StaffAuthContext'; 
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator'; 
import { useToast } from '../ui/use-toast'; 
import { Loader2, LogIn, AlertTriangle, UserCheck } from 'lucide-react';
import * as ethers from 'ethers'; 
import { STAFF_ROLE_HASH, CONTRACTS } from '@/lib/config'; 

// --- DEBUG TYPE ---
interface DebugError {
    type: 'NETWORK' | 'AUTH' | 'ROLE' | 'REVERT';
    details: string;
    action: string;
}

const StaffLoginForm: React.FC = () => {
    const { provider, signer, address: connectedAddress, isConnected, connectWallet, disconnectWallet } = useEthers();
    const { login, logout, isAuthenticated, username: currentUsername, role: staffRole } = useStaffAuth();
    const { toast } = useToast();
    
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [debugError, setDebugError] = useState<DebugError | null>(null); 

    // Auto-logout the staff member if the underlying MetaMask connection is lost
    useEffect(() => {
        if (!isConnected && isAuthenticated) {
            logout();
            toast({ title: "Session Timeout", description: "MetaMask connection lost. Please sign in again.", variant: "destructive" });
        }
    }, [isConnected, isAuthenticated, logout, toast]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setDebugError(null); 

        if (!username) { 
            toast({ title: "Required Field", description: "Username is required.", variant: "destructive" });
            return;
        }
        
        setIsLoading(true);

        try {
            // 1. Initial State Check and Connection Attempt
            if (!isConnected) { await connectWallet(); }
            if (!signer || !connectedAddress) {
                 // This catches the user rejecting the connection in the previous line
                 throw new Error("Wallet connection failed or was rejected.");
            }
            
            const staffAddress = connectedAddress; 
            const message = `Login to $DAG$ Ledger for user: ${username} @ ${Date.now()}`;
            const signature = await signer.signMessage(message); 

            // 3. Verify Signature and Role On-Chain
            const staffRegistryReadOnlyContract = new ethers.Contract(
                CONTRACTS.StaffRegistry.address,
                new ethers.Interface(CONTRACTS.StaffRegistry.abi as any[]),
                provider 
            );

            // 3a: Role Check 
            const isStaffRole = await staffRegistryReadOnlyContract.hasRole(STAFF_ROLE_HASH, staffAddress);
            
            if (!isStaffRole) {
                setDebugError({
                    type: 'ROLE',
                    details: `Wallet address ${staffAddress.slice(0, 8)}... is not registered as Staff.`,
                    action: `Please ask the Manager to create your account or ensure you've connected the correct wallet.`,
                });
                disconnectWallet(); 
                return;
            }
            
            // 3b: Signature Verification 
            const isValidSignature = await staffRegistryReadOnlyContract.verifyStaffSignature(staffAddress, message, signature);

            if (!isValidSignature) {
                 setDebugError({
                    type: 'AUTH',
                    details: `The digital signature failed on-chain verification.`,
                    action: `Your wallet is compromised or the login message was altered.`,
                });
                 return;
            }
            
            // 4. Success: Global Login
            const roleGuess: StaffRole = (username.toLowerCase().includes('sales')) ? 'Sales Manager' : 'Inventory Manager';
            
            login(username, staffAddress, roleGuess); 

            toast({ title: "Login Successful", description: `Authenticated as ${roleGuess}. Redirecting...`, variant: "success", action: <UserCheck className="h-5 w-5" /> });

        } catch (error: any) {
            console.error("Staff Login Failed:", error);
            let debug: DebugError;

            if (error.message && error.message.includes('rejected')) {
                debug = { type: 'AUTH', details: 'MetaMask signature request was rejected by the user.', action: 'Click "Log In" again and approve the signature request.' };
            } else if (error.code === 'CALL_EXCEPTION' || error.message.includes('could not decode result data')) {
                // This captures the RPC/BAD_DATA error
                debug = { type: 'NETWORK', details: 'Unstable RPC node error. Contract read failed.', action: 'Check console for "BAD_DATA" errors. You must switch to a stable RPC endpoint (in MetaMask).' };
            } else {
                debug = { type: 'NETWORK', details: `General connection/Ethers error. Code: ${error.code || 'N/A'}`, action: 'Check your MetaMask network connection and ensure the RPC URL is stable.' };
            }
            setDebugError(debug);
        } finally {
            setIsLoading(false);
        }
    };


    // --- RENDER LOGIC ---

    if (isAuthenticated) { 
        return (
            <Card className="bg-green-900/40 border-green-700 w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-white text-2xl">Welcome, {currentUsername}!</CardTitle>
                    <CardDescription className="text-green-300">
                        You are authenticated as **{staffRole}**. Accessing dashboard...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="ghost" className="w-full text-green-200 hover:bg-green-800" onClick={logout}>Click to Log Out</Button>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card className="bg-gray-800 border-gray-700 w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center"><LogIn className="mr-2 h-5 w-5 text-cyan-400" /> Staff Login</CardTitle>
                <CardDescription className="text-gray-400">
                    Authenticate using your registered Wallet Address via digital signature.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="staff-username" className="text-gray-300">Username/Staff ID</Label>
                        <Input 
                            id="staff-username" 
                            placeholder="sales.manager" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* EXTREME DEBUG PANEL - Appears only on failure */}
                    {debugError && (
                        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm space-y-2">
                            <p className="font-bold text-red-400 flex items-center">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                EXECUTION FAILED: {debugError.type}
                            </p>
                            <Separator className="bg-red-700" />
                            <p className="text-red-200">Error Details: {debugError.details}</p>
                            <p className="font-semibold text-yellow-300 mt-2">Action: {debugError.action}</p>
                        </div>
                    )}
                    
                    {/* Wallet Connection Status */}
                    <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <p className="text-xs text-yellow-100 flex items-center">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Status: {isConnected ? 'Wallet is Connected' : 'Wallet NOT Connected (will auto-connect)'}
                        </p>
                    </div>

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold" disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Requesting Signature...</>
                        ) : (
                            "Log In (Sign Message)"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default StaffLoginForm;