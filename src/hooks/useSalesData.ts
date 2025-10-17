// src/hooks/useSalesData.ts

import { useState, useEffect, useCallback } from 'react';
import { useEthers } from '@/context/EthersContext';
import * as ethers from 'ethers';
import { CONTRACTS } from '@/lib/config';
import { decryptData } from '@/lib/crypto';
import { Interface } from 'ethers';

// --- TYPES ---
interface ItemData {
    actualPrice: number; 
    sellingPrice: number; 
}

interface DecryptedTransactionPayload {
    timestamp: number;
    items: {
        recordId: number;
        quantity: number;
        sellingPrice: number; // Stored in the TX payload for immutable receipt
        costPrice: number;     // Stored in the TX payload for immutable profit calculation
    }[];
}

interface SalesMetrics {
    totalRevenue: number;
    totalProfit: number;
    unitsSold: number;
    timeseriesData: {
        labels: string[];
        monthlyProfit: number[];
        monthlyRevenue: number[];
    };
    isLoaded: boolean;
    error: string | null;
}

const initialMetrics: SalesMetrics = {
    totalRevenue: 0,
    totalProfit: 0,
    unitsSold: 0,
    timeseriesData: { labels: [], monthlyProfit: [], monthlyRevenue: [] },
    isLoaded: false,
    error: null,
};

// --- CORE AGGREGATION LOGIC ---
const useSalesData = (): SalesMetrics => {
    const { provider } = useEthers();
    const [metrics, setMetrics] = useState<SalesMetrics>(initialMetrics);

    const aggregateData = useCallback(async () => {
        if (!provider || !CONTRACTS.TransactionProcessor.address) return;

        setMetrics(prev => ({ ...prev, isLoaded: false, error: null }));
        
        try {
            // 1. Initialize Read-Only Contract
            const txProcessorContract = new ethers.Contract(
                CONTRACTS.TransactionProcessor.address,
                new Interface(CONTRACTS.TransactionProcessor.abi as any[]),
                provider
            );

            // NOTE: Since the contract doesn't expose a total count, 
            // we have to rely on event indexing or fetching up to a hardcoded ID.
            // We'll simulate fetching events for this demo.
            
            // In a real app, you would fetch all SaleProcessed events
            const latestTxId = 100; // SIMULATE: Assume max 100 transactions for a simple loop

            let totalRevenue = 0;
            let totalProfit = 0;
            let unitsSold = 0;
            const monthlyData: { [key: string]: { revenue: number; profit: number } } = {};
            const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' });
            
            // 2. Loop Through Transactions
            for (let id = 1; id <= latestTxId; id++) {
                try {
                    // getTransaction returns (encryptedPayload, salesManagerAddress, timestamp)
                    const [encryptedPayload, , timestampBigInt] = await txProcessorContract.getTransaction(id);

                    if (encryptedPayload === "") continue;

                    // Decrypt Payload
                    const plaintextString = decryptData(encryptedPayload);
                    const txPayload: DecryptedTransactionPayload = JSON.parse(plaintextString);
                    
                    const transactionTimestamp = Number(timestampBigInt) * 1000;
                    const monthKey = dateFormatter.format(transactionTimestamp);

                    // Aggregate Metrics for this TX
                    let txRevenue = 0;
                    let txProfit = 0;

                    for (const item of txPayload.items) {
                        const profit = (item.sellingPrice - item.costPrice) * item.quantity;
                        txRevenue += item.sellingPrice * item.quantity;
                        txProfit += profit;
                        unitsSold += item.quantity;
                    }

                    totalRevenue += txRevenue;
                    totalProfit += txProfit;

                    // Aggregate Monthly Data
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { revenue: 0, profit: 0 };
                    }
                    monthlyData[monthKey].revenue += txRevenue;
                    monthlyData[monthKey].profit += txProfit;

                } catch (e: any) {
                    if (e.reason && e.reason.includes("Record not found")) continue;
                    // Stop on decryption failure or contract read failure
                    console.warn(`Stopped aggregation on TX ID ${id} due to error:`, e.message);
                    break;
                }
            }

            // 3. Finalize Time Series Data
            const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            
            const timeseriesData = {
                labels: sortedMonths,
                monthlyProfit: sortedMonths.map(month => monthlyData[month].profit),
                monthlyRevenue: sortedMonths.map(month => monthlyData[month].revenue),
            };

            setMetrics({
                totalRevenue, totalProfit, unitsSold, timeseriesData,
                isLoaded: true, error: null
            });

        } catch (e: any) {
            setMetrics(prev => ({ ...prev, error: "Network or Contract Read Failed during aggregation.", isLoaded: true }));
            console.error("Aggregation Failed:", e);
        }
    }, [provider]);


    useEffect(() => {
        // Fetch immediately and poll every 60 seconds
        aggregateData();
        const intervalId = setInterval(aggregateData, 60000); 
        return () => clearInterval(intervalId);
    }, [aggregateData]);

    return metrics;
};

export default useSalesData;