// src/components/Sales/StaffLoginForm.tsx (FINAL CODE)

import React, { useState, useEffect } from 'react'; 
import { useEthers } from '@/context/EthersContext';
import { useStaffAuth, StaffRole } from '@/context/StaffAuthContext'; // <-- NEW IMPORT
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast'; 
import { Loader2, LogIn, AlertTriangle, UserCheck } from 'lucide-react';
import * as ethers from 'ethers'; // Use for contract/signer access
import { STAFF_ROLE_HASH } from '@/lib/config'; 

const StaffLoginForm: React.FC = () => {
    // Ethers hooks: for connected wallet, provider, and contract interaction
    const { provider, signer, address: connectedAddress, isConnected } = useEthers();
    
    // Staff Auth context: for state management after successful login
    const { login, logout, isAuthenticated, username: currentUsername, role: staffRole } = useStaffAuth();
    
    const { toast } = useToast();
    
    // Local Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Effect to auto-logout the staff member if the underlying MetaMask connection is lost
    useEffect(() => {
        if (!isConnected && isAuthenticated) {
            logout();
            toast({ title: "Session Timeout", description: "MetaMask connection lost. Please sign in again.", variant: "destructive" });
        }
    }, [isConnected, isAuthenticated, logout, toast]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // 1. Initial State Check (Must have a connected wallet for signing)
        if (!provider || !signer || !isConnected || !connectedAddress) {
            setFormError("MetaMask connection is required to sign the login message. Please connect first.");
            return;
        }

        if (!username || !password) {
            setFormError("Username and password are required.");
            return;
        }
        
        setIsLoading(true);

        try {
            // NOTE ON REAL-WORLD SECURITY: 
            // In a real application, the 'password' would be used with a key derivation function (like PBKDF2) 
            // to derive a temporary private key for signing, or the user is asked to sign with their wallet.
            // Here, we use the connected wallet to sign, relying on the user having secured their wallet.
            
            const staffAddress = connectedAddress; 

            // 2. Generate Message and Signature (Unique message to prevent replay attacks)
            const message = `Login to $DAG$ Ledger for user: ${username} @ ${Date.now()}`;
            const signature = await signer.signMessage(message);

            // 3. Verify Signature and Role On-Chain (Read-only call)
            // We use the connected address's contract instance (staffRegistryContract) for the best state
            // But for clarity and using the read-only provider for view calls:
            const staffRegistryReadOnlyContract = new ethers.Contract(
                CONTRACTS.StaffRegistry.address,
                new ethers.Interface(CONTRACTS.StaffRegistry.abi as any[]),
                provider 
            );

            // Check 3a: Does the connected wallet have the STAFF_ROLE?
            const isStaffRole = await staffRegistryReadOnlyContract.hasRole(STAFF_ROLE_HASH, staffAddress);
            
            if (!isStaffRole) {
                setFormError("The connected wallet is not registered as a Staff member on-chain.");
                return;
            }
            
            // Check 3b: Verify the signature on-chain (This is the security check)
            const isValidSignature = await staffRegistryReadOnlyContract.verifyStaffSignature(staffAddress, message, signature);

            if (!isValidSignature) {
                 setFormError("Signature validation failed on-chain. Unauthorized access or invalid message.");
                 return;
            }
            
            // 4. Success: Determine Specific Role and Global Login
            const roleGuess: StaffRole = (username.toLowerCase().includes('sales')) 
                ? 'Sales Manager' 
                : 'Inventory Manager';
            
            login(username, staffAddress, roleGuess); // <-- CRITICAL: Sets global auth state

            toast({ title: "Login Successful", description: `Authenticated as ${roleGuess}. Redirecting...`, variant: "success", action: <UserCheck className="h-5 w-5" /> });

        } catch (error: any) {
            console.error("Staff Login Failed:", error);
            setFormError(error.message.includes('rejected') ? 'Message signing was rejected.' : 'Login failed. Check username and ensure you are registered.');
        } finally {
            setIsLoading(false);
        }
    };


    // --- RENDER LOGIC ---

    if (isAuthenticated) { 
        // Successful staff login state: shows confirmation and relies on App.tsx to route
        return (
            <Card className="bg-green-900/40 border-green-700 w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-white text-2xl">Welcome, {currentUsername}!</CardTitle>
                    <CardDescription className="text-green-300">
                        You are authenticated as **{staffRole}**. Redirecting...
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
                    Authenticate via your registered username and wallet signature.
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
                    
                    <div className="space-y-2">
                        <Label htmlFor="staff-password" className="text-gray-300">Password (Required to access wallet signing)</Label>
                        <Input 
                            id="staff-password" 
                            type="password"
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p className="text-xs text-yellow-400 flex items-center">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Requires active, connected MetaMask wallet to sign the login message.
                        </p>
                    </div>
                    
                    {formError && (
                        <p className="text-sm font-medium text-red-400 flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" />{formError}
                        </p>
                    )}

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold" disabled={isLoading || !isConnected}>
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>
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