// src/components/Manager/PasskeyUpdateForm.tsx (New Passkey Change UI)

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useToast } from '../ui/use-toast';
import { Lock, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { verifyPasskey, setPasskey, isDefaultPasskey } from '@/lib/authUtils'; 
import { useEthers } from '@/context/EthersContext'; 

const PasskeyUpdateForm: React.FC = () => {
    const { address, isConnected } = useEthers();
    const { toast } = useToast();
    
    const [currentPasskey, setCurrentPasskey] = useState('');
    const [newPasskey, setNewPasskey] = useState('');
    const [confirmPasskey, setConfirmPasskey] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    // User identifier is the connected wallet address
    const userIdentifier = address || '';
    const isNewUser = isDefaultPasskey(userIdentifier);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!address || !isConnected) {
            toast({ title: "Error", description: "Please connect your wallet first.", variant: "destructive" });
            return;
        }

        if (newPasskey !== confirmPasskey) {
            toast({ title: "Error", description: "New passkeys do not match.", variant: "destructive" });
            return;
        }

        if (newPasskey.length < 6) {
            toast({ title: "Error", description: "Passkey must be at least 6 characters.", variant: "destructive" });
            return;
        }

        setIsUpdating(true);
        
        try {
            // 1. Verification Logic
            if (!isNewUser) {
                 if (!verifyPasskey(userIdentifier, currentPasskey)) {
                    toast({ title: "Error", description: "Current Passkey is incorrect.", variant: "destructive" });
                    setIsUpdating(false);
                    return;
                }
            } else {
                // For new users, we only check if they entered the default passkey to prove they read the message
                if (currentPasskey !== 'privetekey') {
                    toast({ title: "Error", description: "Please enter the default passkey 'privetekey' to proceed.", variant: "destructive" });
                    setIsUpdating(false);
                    return;
                }
            }

            // 2. SET NEW PASSKEY (Off-chain storage simulation)
            setPasskey(userIdentifier, newPasskey);
            
            toast({
                title: "Passkey Updated",
                description: `Your new Passkey has been set for ${userIdentifier.slice(0, 8)}...`,
                variant: "success",
            });

            setCurrentPasskey('');
            setNewPasskey('');
            setConfirmPasskey('');

        } catch (e) {
            toast({ title: "Error", description: "An unexpected error occurred during update.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };


    return (
        <Card className="bg-gray-800 border-gray-700 w-full max-w-xl">
            <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center"><Lock className="mr-2 h-5 w-5 text-yellow-400" /> Passkey Security</CardTitle>
                <CardDescription className="text-gray-400">
                    Your Passkey is an **OFF-CHAIN** password used to authorize sensitive transactions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                    
                    {isNewUser && (
                        <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-sm text-yellow-300 font-semibold">
                            <AlertTriangle className="mr-2 h-4 w-4 inline-block" />
                            Security Alert: Your default passkey is **'privetekey'**. Please change it immediately.
                        </div>
                    )}
                    
                    {/* Current Passkey Field */}
                    <div className="space-y-2">
                        <Label htmlFor="current-passkey" className="text-gray-300">Current Passkey {isNewUser && "(Default is 'privetekey')"}</Label>
                        <Input 
                            id="current-passkey" 
                            type="password"
                            placeholder="Current Passkey" 
                            value={currentPasskey}
                            onChange={(e) => setCurrentPasskey(e.target.value)}
                            required
                        />
                    </div>

                    <Separator className="bg-gray-700" />
                    
                    {/* New Passkey Field */}
                    <div className="space-y-2">
                        <Label htmlFor="new-passkey" className="text-gray-300">New Passkey (Minimum 6 characters)</Label>
                        <Input 
                            id="new-passkey" 
                            type="password"
                            placeholder="Enter new passkey" 
                            value={newPasskey}
                            onChange={(e) => setNewPasskey(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Confirm Passkey Field */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm-passkey" className="text-gray-300">Confirm New Passkey</Label>
                        <Input 
                            id="confirm-passkey" 
                            type="password"
                            placeholder="Confirm new passkey" 
                            value={confirmPasskey}
                            onChange={(e) => setConfirmPasskey(e.target.value)}
                            required
                        />
                    </div>
                    
                    <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold" disabled={isUpdating || !isConnected}>
                        {isUpdating ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating Passkey...</>
                        ) : (
                            <><Save className="mr-2 h-4 w-4" /> Set New Passkey</>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default PasskeyUpdateForm;