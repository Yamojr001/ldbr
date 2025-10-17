import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { ShoppingCart, Search, Receipt, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useEthers } from '@/context/EthersContext';
import { encryptData } from '@/lib/crypto';
import * as ethers from 'ethers';

// NEW IMPORTS: Hook for fetching real data
import useDecryptedInventory, { InventoryItem } from '@/hooks/useDecryptedInventory';

// Simple mock for cart item structure
interface CartItem {
    item: InventoryItem;
    quantity: number;
    subtotal: number;
}

// Transaction Payload Structure (Encrypted On-Chain)
interface TransactionPayload {
    customer: {
        phone: string;
        name: string; // Stored encrypted
        address: string; // Stored encrypted
    };
    items: {
        recordId: number;
        quantity: number;
        sellingPrice: number;
        costPrice: number;
    }[];
    total: number;
}

const CheckoutTerminal: React.FC = () => {
    const { inventoryLedgerContract, transactionProcessorContract, address, isConnected } = useEthers();
    const { data: realInventory, isLoading: inventoryLoading, error: inventoryError } = useDecryptedInventory(); // <-- USE REAL INVENTORY
    const { toast } = useToast();

    // State
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('New Customer');
    const [customerAddress, setCustomerAddress] = useState('N/A');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Calculated Totals
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 0.05; 
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Search logic now filters the REAL Inventory
    const searchResults = realInventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.currentStock > 0
    );

    // --- Core Logic ---

    const handleAddItemToCart = (item: InventoryItem) => {
        const existingItem = cart.find(cartItem => cartItem.item.recordId === item.recordId);
        
        // Find the current stock level from the real inventory data
        const currentStock = realInventory.find(i => i.recordId === item.recordId)?.currentStock || 0;

        if (existingItem) {
            if (existingItem.quantity >= currentStock) {
                toast({ title: "Stock Limit", description: "Cannot add more. Reached current stock level.", variant: "destructive" });
                return;
            }
            setCart(cart.map(cartItem => 
                cartItem.item.recordId === item.recordId 
                    ? { ...cartItem, quantity: cartItem.quantity + 1, subtotal: (cartItem.quantity + 1) * item.sellingPrice } 
                    : cartItem
            ));
        } else {
            setCart([...cart, { item, quantity: 1, subtotal: item.sellingPrice }]);
        }
    };
    
    // NOTE: This logic remains the same, as it calls the corrected contract method
    const handleProcessSale = async () => {
        if (cart.length === 0) { /* ... */ return; }

        setIsProcessing(true);
        let txs: ethers.ContractTransactionResponse[] = [];

        try {
            // 1. Prepare On-Chain Transaction Payload (Encrypt all sensitive data)
            const payloadItems = cart.map(cartItem => ({
                recordId: cartItem.item.recordId,
                quantity: cartItem.quantity,
                sellingPrice: cartItem.item.sellingPrice,
                costPrice: cartItem.item.actualPrice, // ActualPrice is the Cost Price
            }));

            const transactionPayload: TransactionPayload = {
                customer: { phone: customerPhone, name: customerName, address: customerAddress, },
                items: payloadItems,
                total: total,
            };

            const encryptedPayload = encryptData(JSON.stringify(transactionPayload));

            // 2. Process Inventory Updates (Decrement Stock)
            for (const item of cart) {
                // The updated stock logic uses a safe negative number
                const stockTx = await inventoryLedgerContract.updateStock(
                    item.item.recordId,
                    -item.quantity 
                );
                txs.push(stockTx);
            }
            
            await Promise.all(txs.map(tx => tx.wait()));


            // 3. Record Sale Transaction (Encrypted)
            const saleTx = await transactionProcessorContract.processSale(encryptedPayload, address);
            await saleTx.wait();


            // 4. Final Success
            toast({ title: "Transaction Complete", description: "Sale recorded and stock updated on-chain!", variant: "success", action: <Receipt className="h-5 w-5" /> });
            
            // Reset
            setCart([]);
            setCustomerPhone('');
            setCustomerName('New Customer');
            setCustomerAddress('N/A');

        } catch (error: any) {
            console.error("Checkout Failed:", error);
            toast({ title: "Transaction Reverted", description: "Sale failed. Insufficient stock or contact a Manager.", variant: "destructive", action: <AlertTriangle className="h-5 w-5" /> });
        } finally {
            setIsProcessing(false);
        }
    };


    if (inventoryLoading) {
        return <Card className="h-96 flex items-center justify-center bg-gray-800"><Loader2 className="mr-2 h-8 w-8 animate-spin text-cyan-400" /><p className="text-gray-400">Loading Decrypted Inventory...</p></Card>;
    }
    
    if (inventoryError) {
        return <Card className="h-96 flex items-center justify-center bg-red-900/20 border-red-700"><AlertTriangle className="mr-2 h-8 w-8 text-red-400" /><p className="text-red-400">Error loading inventory: {inventoryError}</p></Card>;
    }


    return (
        <div className="grid grid-cols-3 gap-6 w-full h-full max-w-7xl mx-auto">
            {/* COLUMN 1: Customer Info & Item Search */}
            <Card className="col-span-2 bg-gray-900 border-gray-800 shadow-xl overflow-y-auto">
                {/* ... (Header remains the same) ... */}
                <CardContent className="space-y-6">
                    {/* Customer Info */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="py-3"><CardTitle className="text-lg text-white">Customer Profile</CardTitle></CardHeader>
                        <CardContent className="space-y-3 pb-4">
                            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="E.g., +1-555-1234" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}/>
                            <div className="flex space-x-3">
                                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name" />
                                <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Address" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Item Search */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="py-3"><CardTitle className="text-lg text-white">Search Inventory</CardTitle></CardHeader>
                        <CardContent>
                            <Input placeholder="Search by item name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                                {searchResults.map(item => (
                                    <div key={item.recordId} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                                        <div className="text-white">
                                            <span className="font-semibold">{item.name}</span>
                                            <span className="ml-3 text-sm text-gray-400">(${item.sellingPrice.toFixed(2)})</span>
                                        </div>
                                        <Button size="sm" onClick={() => handleAddItemToCart(item)} disabled={item.currentStock === 0}>
                                            Add ({item.currentStock} left)
                                        </Button>
                                    </div>
                                ))}
                                {searchResults.length === 0 && searchTerm && <p className="text-center text-gray-500">No items found matching "{searchTerm}".</p>}
                                {realInventory.length === 0 && !searchTerm && <p className="text-center text-gray-500">Inventory is empty. Add items in the Inventory tab.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            {/* COLUMN 2: Cart & Checkout */}
            <Card className="col-span-1 bg-gray-900 border-gray-800 shadow-xl flex flex-col">
                {/* ... (Header remains the same) ... */}
                <CardContent className="flex-grow flex flex-col justify-between">
                    {/* Cart Items List */}
                    <div className="flex-grow space-y-3 max-h-64 overflow-y-auto mb-4">
                        {cart.map((cartItem, index) => (
                            <div key={index} className="flex justify-between text-sm text-white">
                                <span>{cartItem.quantity}x {cartItem.item.name.slice(0, 20)}...</span>
                                <span>${cartItem.subtotal.toFixed(2)}</span>
                            </div>
                        ))}
                        {cart.length === 0 && <p className="text-center text-gray-500 pt-10">Cart is Empty.</p>}
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Totals */}
                    <div className="space-y-2 py-4">
                        <div className="flex justify-between text-gray-300 text-base"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-300 text-base"><span>Tax ({taxRate * 100}%):</span><span>${tax.toFixed(2)}</span></div>
                        <Separator className="bg-gray-600" />
                        <div className="flex justify-between text-3xl font-bold text-white"><span>TOTAL:</span><span>${total.toFixed(2)}</span></div>
                    </div>

                    {/* Checkout Button */}
                    <Button 
                        onClick={handleProcessSale}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold text-lg"
                        disabled={isProcessing || cart.length === 0}
                    >
                        {isProcessing ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing On-Chain TX...</>
                        ) : (
                            "Process Sale & Commit"
                        )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">Sale is recorded as an encrypted, immutable transaction on the BlockDAG.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckoutTerminal;