// src/components/Inventory/AddItemForm.tsx (FINAL CODE)

import React, { useState } from 'react';
import { useEthers } from '@/context/EthersContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast'; 
import { encryptData } from '@/lib/crypto'; 
import { Loader2, PackagePlus, AlertTriangle, CheckCircle } from 'lucide-react';
import * as ethers from 'ethers'; // FIX: Import everything as ethers
import { isAddress } from 'ethers'; // Keep isAddress for utility

// Define the structure of the plaintext data we will encrypt
interface ItemData {
    name: string;
    category: string;
    actualPrice: number; 
    sellingPrice: number; 
}

const AddItemForm: React.FC = () => {
    const { inventoryLedgerContract, isConnected } = useEthers();
    const { toast } = useToast();
    
    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [actualPrice, setActualPrice] = useState<number | ''>('');
    const [sellingPrice, setSellingPrice] = useState<number | ''>('');
    const [initialStock, setInitialStock] = useState<number | ''>('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!inventoryLedgerContract || !isConnected) {
            setFormError("Wallet not connected or Contract not initialized.");
            return;
        }

        // 1. Client-side Validation
        if (!name || !category || actualPrice === '' || sellingPrice === '' || initialStock === '' || Number(initialStock) < 1) {
            setFormError("All fields must be valid, and stock must be > 0.");
            return;
        }

        // 2. Prepare Plaintext Data
        const plaintextItemData: ItemData = {
            name,
            category,
            actualPrice: Number(actualPrice),
            sellingPrice: Number(sellingPrice),
        };
        const plaintextString = JSON.stringify(plaintextItemData);

        // 3. Encrypt the Data (Core Requirement)
        let encryptedData: string;
        try {
            encryptedData = encryptData(plaintextString);
        } catch (err: any) {
            setFormError(`Encryption Failed: ${err.message}`);
            return;
        }
        
        setIsSubmitting(true);

        try {
            // 4. Transaction Call: addItem(string memory _encryptedData, uint256 _initialStock)
            const tx = await inventoryLedgerContract.addItem(
                encryptedData,
                BigInt(initialStock as number)
            );

            toast({ title: "Transaction Sent", description: `Encrypting & adding item: ${name}.` });

            await tx.wait();

            toast({
                title: "Item Added Successfully!",
                description: `Encrypted record committed to BlockDAG.`,
                variant: "success",
                action: <CheckCircle className="h-5 w-5" />
            });

            // 5. Reset Form
            setName(''); setCategory(''); setActualPrice(''); setSellingPrice(''); setInitialStock('');

        } catch (error: any) {
            console.error("Add Item Error:", error);
            // General error message for user
            setFormError("Transaction failed. Ensure you have the MANAGER_ROLE and gas.");
            toast({ title: "Error", description: "Failed to add item to inventory.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-gray-800 border-gray-700 w-full">
            <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center"><PackagePlus className="mr-2 h-5 w-5 text-cyan-400" /> Add New Inventory Item</CardTitle>
                <CardDescription className="text-gray-400">
                    All sensitive data is AES-256 Encrypted client-side. Only Managers can submit new items.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4">
                    
                    <div className="space-y-2 col-span-1">
                        <Label htmlFor="name" className="text-gray-300">Item Name</Label>
                        <Input id="name" placeholder="Laptop Model X" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2 col-span-1">
                        <Label htmlFor="category" className="text-gray-300">Category</Label>
                        <Input id="category" placeholder="Electronics / Gadgets" value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>

                    <div className="space-y-2 col-span-1">
                        <Label htmlFor="actualPrice" className="text-gray-300">Actual Cost Price (USD)</Label>
                        <Input 
                            id="actualPrice" 
                            type="number" 
                            step="0.01"
                            placeholder="999.99" 
                            value={actualPrice} 
                            onChange={(e) => setActualPrice(Number(e.target.value))} 
                            required 
                        />
                    </div>
                    <div className="space-y-2 col-span-1">
                        <Label htmlFor="sellingPrice" className="text-gray-300">Selling Price (USD)</Label>
                        <Input 
                            id="sellingPrice" 
                            type="number" 
                            step="0.01"
                            placeholder="1299.99" 
                            value={sellingPrice} 
                            onChange={(e) => setSellingPrice(Number(e.target.value))} 
                            required 
                        />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="initialStock" className="text-gray-300">Initial Stock Quantity</Label>
                        <Input 
                            id="initialStock" 
                            type="number" 
                            placeholder="100" 
                            value={initialStock} 
                            onChange={(e) => setInitialStock(Number(e.target.value))} 
                            required 
                        />
                    </div>

                    {formError && (
                        <p className="text-sm font-medium text-red-400 flex items-center col-span-2">
                            <AlertTriangle className="mr-2 h-4 w-4" />{formError}
                        </p>
                    )}

                    <Button type="submit" className="w-full col-span-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold" disabled={isSubmitting || !isConnected}>
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Encrypting & Committing Record...</>
                        ) : (
                            "Add Item to Encrypted Inventory"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default AddItemForm;