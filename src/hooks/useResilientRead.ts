// src/hooks/useResilientRead.ts (FINAL CODE)

import { useCallback } from 'react';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

const useResilientRead = () => {
    const resilientRead = useCallback(async <T>(callFn: () => Promise<T>): Promise<T> => {
        
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await callFn();
                return result; 
            } catch (error: any) {
                // Check for transient network/RPC errors
                if (
                    error.code === 'BAD_DATA' || 
                    error.code === 'CALL_EXCEPTION' || 
                    error.code === 'NETWORK_ERROR'
                ) {
                    console.warn(`⚠️ Resilient Read Failed (Attempt ${attempt}/${MAX_RETRIES})`, { code: error.code, method: error.info?.method || 'N/A' });
                    
                    if (attempt < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
                        continue; 
                    }
                }
                
                // If it's a persistent error or max retries reached, re-throw it.
                throw error;
            }
        }
        // Should be unreachable
        throw new Error("Resilient Read Failed after maximum retries.");
    }, []);

    return resilientRead;
};

export default useResilientRead;