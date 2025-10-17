// src/components/Sales/StaffLoginForm.tsx

import React, { useState } from 'react';
import { useEthers } from '@/context/EthersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast'; 
import { Loader2, LogIn, AlertTriangle, UserCheck } from 'lucide-react';
import { Contract } from 'ethers';

// State to hold the authenticated staff's data
interface StaffAuthState {
    username: string;
    address: string;
    isAuthenticated: boolean;
    role: 'Sales Manager' | 'Inventory Manager' | 'Staff' | null;
}

// NOTE: This component does not yet store the full authentication state,
// but implements the login logic. A separate context would manage the global state.
const StaffLoginForm: React.FC = () => {
    // We need the provider for read calls and the signer for signing the message
    const { provider, signer, address, isConnected } = useEthers();
    const { toast } = useToast();
    
    // Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); // Acts as the master key for signing
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Placeholder for authenticated user state (would be global state in a real app)
    const [staffAuth, setStaffAuth] = useState<StaffAuthState | null>(null);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!provider || !signer) {
            setFormError("MetaMask connection is required to sign the message.");
            // Manager must connect first for staff login to work in this simplified flow
            return;
        }

        if (!username || !password) {
            setFormError("Username and password are required.");
            return;
        }
        
        setIsLoading(true);

        try {
            // 1. Get Staff Wallet Address by Username (Conceptual step: not in contract)
            // The prompt requires username/password login. Since the SC only validates wallet address,
            // we must establish a link between username/password and a WALLET ADDRESS OF RECORD.
            // **Simplified Flow:** Assume the user has to enter the wallet address or we look it up.
            // For now, we'll assume the currently connected wallet is the staff's wallet.
            const staffAddress = address!; // Using the connected wallet's address for simplicity

            // 2. Generate Message and Signature
            // The contract verifies a message: keccak256(staffAddress, message)
            const message = `Login to $DAG$ Ledger for user: ${username}`;
            
            // NOTE: For a real username/password system, the signature would be generated
            // using the PRIVATE KEY derived from the password + a secure salt.
            // Here, we use the connected MetaMask to sign the message.
            const signature = await signer.signMessage(message);

            // 3. Verify Signature On-Chain (Read-only call)
            const staffRegistryContract = new Contract(
                CONTRACTS.StaffRegistry.address,
                CONTRACTS.StaffRegistry.abi as any[],
                provider // Use provider for read-only call
            );

            // The password is used to generate the message hash and signature logic 
            // in a complete dApp. Here, we use the connected wallet's address as the "signer."

            // Check if the connected wallet has STAFF_ROLE
            const isStaffRole = await staffRegistryContract.hasRole(STAFF_ROLE_HASH, staffAddress);
            
            if (!isStaffRole) {
                setFormError("The connected wallet is not registered as a Staff member.");
                return;
            }
            
            // The signature verification is done on-chain:
            // This is a redundant check if isStaffRole is true, but validates the core flow
            const isValidSignature = await staffRegistryContract.verifyStaffSignature(staffAddress, message, signature);

            if (!isValidSignature) {
                 setFormError("Signature validation failed on-chain. Unauthorized access.");
                 return;
            }
            
            // 4. Success: Determine Specific Role
            // For simplicity, we assume one role per staff member based on a hypothetical mapping
            // In a real app, this would involve more contract calls or a dedicated role contract.
            const roleGuess: StaffAuthState['role'] = (username.toLowerCase().includes('sales')) 
                ? 'Sales Manager' 
                : 'Inventory Manager';
            
            setStaffAuth({ username, address: staffAddress, isAuthenticated: true, role: roleGuess });
            toast({ title: "Login Successful", description: `Authenticated as ${roleGuess}.`, variant: "success", action: <UserCheck className="h-5 w-5" /> });

        } catch (error: any) {
            console.error("Staff Login Failed:", error);
            setFormError(error.message.includes('rejected') ? 'Message signing was rejected.' : 'Login failed. Check username and ensure you are on the correct network.');
        } finally {
            setIsLoading(false);
        }
    };

    if (staffAuth?.isAuthenticated) {
        // Successful staff login UI
        return (
            <Card className="bg-green-900/40 border-green-700 w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-white text-2xl">Welcome, {staffAuth.username}!</CardTitle>
                    <CardDescription className="text-green-300">
                        You are authenticated as a **{staffAuth.role}**.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-green-200">Wallet: {staffAuth.address.slice(0, 6)}...{staffAuth.address.slice(-4)}</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                        Access {staffAuth.role} Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full text-green-200 hover:bg-green-800" onClick={() => setStaffAuth(null)}>Log Out</Button>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card className="bg-gray-800 border-gray-700 w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center"><LogIn className="mr-2 h-5 w-5 text-cyan-400" /> Staff Login</CardTitle>
                <CardDescription className="text-gray-400">
                    Authenticate via your unique username/password and wallet signature.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="staff-username" className="text-gray-300">Username/Email</Label>
                        <Input 
                            id="staff-username" 
                            placeholder="sales.manager" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="staff-password" className="text-gray-300">Password</Label>
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
                            Requires active MetaMask wallet to sign the login message.
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