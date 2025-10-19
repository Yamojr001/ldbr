// src/components/Sales/StaffLoginForm.tsx (FINAL CODE: Signature + VerifyStaffSignature)

import React, { useState, useEffect } from 'react';
import { useEthers } from '@/context/EthersContext';
import { useStaffAuth, StaffRole } from '@/context/StaffAuthContext'; 
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator'; 
import { useToast } from '../ui/use-toast'; 
import { Loader2, LogIn, AlertTriangle, UserCheck } from 'lucide-react';
import * as ethers from 'ethers'; 
import { STAFF_ROLE_HASH, CONTRACTS } from '@/lib/config'; 

const StaffLoginForm: React.FC = () => {
    // We remove the Passkey logic and use the Signer logic exclusively
    const { provider, signer, address: connectedAddress, isConnected, connectWallet, disconnectWallet } = useEthers();
    const { login, logout, isAuthenticated, username: currentUsername, role: staffRole } = useStaffAuth();
    const { toast } = useToast();
    
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Auto-logout the staff member if the underlying MetaMask connection is lost
    useEffect(() => {
        if (!isConnected && isAuthenticated) {
            logout();
            toast({ title: "Session Timeout", description: "MetaMask connection lost. Please sign in again.", variant: "destructive" });
        }
    }, [isConnected, isAuthenticated, logout, toast]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!username) { 
            setFormError("Username is required.");
            return;
        }
        
        setIsLoading(true);

        try {
            // 1. Initial State Check and Connection Attempt
            if (!isConnected) { await connectWallet(); }
            if (!signer || !connectedAddress) {
                 throw new Error("Wallet connection failed or was rejected.");
            }
            
            const staffAddress = connectedAddress; 
            
            // 2. Generate Message and Signature (Unique message for security)
            const message = `Login to $DAG$ Ledger for user: ${username} @ ${Date.now()}`;
            // CRITICAL STEP: Triggers MetaMask Pop-up for signature
            const signature = await signer.signMessage(message); 

            // 3. Verify Signature and Role On-Chain
            const staffRegistryReadOnlyContract = new ethers.Contract(
                CONTRACTS.StaffRegistry.address,
                new ethers.Interface(CONTRACTS.StaffRegistry.abi as any[]),
                provider 
            );

            // 3a: Role Check (Is this wallet a Staff member?)
            const isStaffRole = await staffRegistryReadOnlyContract.hasRole(STAFF_ROLE_HASH, staffAddress);
            
            if (!isStaffRole) {
                setFormError("The connected wallet is not registered as a Staff member on-chain.");
                // Note: No auto-disconnect here, as user might want to try Manager login or Staff login.
                return;
            }
            
            // 3b: Signature Verification (On-chain proof of ownership)
            const isValidSignature = await staffRegistryReadOnlyContract.verifyStaffSignature(staffAddress, message, signature);

            if (!isValidSignature) {
                 setFormError("Signature validation failed on-chain. Unauthorized access.");
                 return;
            }
            
            // 4. Success: Global Login
            const roleGuess: StaffRole = (username.toLowerCase().includes('sales')) ? 'Sales Manager' : 'Inventory Manager';
            
            login(username, staffAddress, roleGuess); 

            toast({ title: "Login Successful", description: `Authenticated as ${roleGuess}. Redirecting...`, variant: "success", action: <UserCheck className="h-5 w-5" /> });

        } catch (error: any) {
            console.error("Staff Login Failed:", error);
            // Handle user rejection and RPC errors
            const errorMessage = error.message.includes('rejected') ? 'Signature was rejected.' : 'Login failed. RPC/Network issues.';
            setFormError(errorMessage);
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
                    Authenticate using your registered Username. Requires Wallet Signature.
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
                    
                    <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-300 flex items-center mb-1">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Security Protocol
                        </p>
                        <p className="text-xs text-yellow-100">
                            Clicking "Log In" will initiate a **digital signature** request in your MetaMask wallet.
                        </p>
                    </div>
                    
                    {formError && (
                        <p className="text-sm font-medium text-red-400 flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" />{formError}
                        </p>
                    )}

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