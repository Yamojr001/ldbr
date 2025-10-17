// src/components/Manager/StaffCreationForm.tsx

import React, { useState } from 'react';
import { useEthers } from '@/context/EthersContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast'; 
import { Loader2, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import { isAddress } from 'ethers'; // Ethers v6 utility for address validation
import { STAFF_ROLE_HASH, MANAGER_ROLE_HASH } from '@/lib/config'; // Required for checking roles/hashes

type StaffRole = 'Sales Manager' | 'Inventory Manager';

const StaffCreationForm: React.FC = () => {
    const { staffRegistryContract, isConnected } = useEthers();
    const { toast } = useToast();
    
    const [username, setUsername] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [role, setRole] = useState<StaffRole>('Sales Manager');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!staffRegistryContract || !isConnected) {
            setFormError("Wallet not connected or Contract not initialized.");
            return;
        }

        // 1. Client-side Validation
        if (!isAddress(walletAddress)) { 
            setFormError("Invalid Ethereum Wallet Address.");
            return;
        }
        
        setIsSubmitting(true);

        try {
            // 2. Transaction Call: createStaffAccount(string memory username, address staffAddress)
            const tx = await staffRegistryContract.createStaffAccount(username, walletAddress);

            toast({ title: "Transaction Sent", description: `Creating ${role} account for ${username}.` });

            // 3. Wait for Transaction Confirmation 
            await tx.wait();

            toast({
                title: "Success!",
                description: `${role} account created. Wallet: ${walletAddress}`,
                variant: "success",
                action: <CheckCircle className="h-5 w-5" />
            });

            // 4. Reset Form
            setUsername('');
            setWalletAddress('');

        } catch (error: any) {
            console.error("Staff Creation Error:", error);
            let message = "Transaction failed. Ensure this address/username is unique and you have gas.";
            
            setFormError(message);
            toast({ title: "Transaction Failed", description: message, variant: "destructive" });

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-gray-800 border-gray-700 w-full">
            <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center"><UserPlus className="mr-2 h-5 w-5 text-cyan-400" /> New Staff Member</CardTitle>
                <CardDescription className="text-gray-400">
                    Create a new user account (Sales or Inventory) and assign their wallet address.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-gray-300">Username</Label>
                        <Input 
                            id="username" 
                            placeholder="e.g., inventory_john" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="walletAddress" className="text-gray-300">Staff Wallet Address</Label>
                        <Input 
                            id="walletAddress" 
                            placeholder="0x..." 
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500">The Staff member must use this wallet to authenticate and sign messages.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-300">Role (Front-end Label)</Label>
                        <Select value={role} onValueChange={(value: StaffRole) => setRole(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600 text-white">
                                <SelectItem value="Sales Manager">💰 Sales Manager</SelectItem>
                                <SelectItem value="Inventory Manager">📦 Inventory Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {formError && (
                        <p className="text-sm font-medium text-red-400 flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" />{formError}
                        </p>
                    )}

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold" disabled={isSubmitting || !isConnected}>
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending Transaction...</>
                        ) : (
                            "Create Staff Account"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default StaffCreationForm;