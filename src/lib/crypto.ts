// src/lib/crypto.ts

import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { WordArray } from 'crypto-js'; // Import WordArray for proper typing

// IMPORTANT: This key must be securely managed (e.g., loaded from a secure vault or derived from a password).
// We use a VITE_ env variable for a development key.
const ENCRYPTION_SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'MySuperSecretDAGKeyForClientSideEncryption'; 

/**
 * Encrypts a plaintext string using AES-256 with the common secret key.
 * @param plaintext The data to encrypt.
 * @returns The encrypted data as a string (Ciphertext).
 */
export function encryptData(plaintext: string): string {
    if (!plaintext) return '';
    try {
        // Encrypt the data
        const ciphertext = AES.encrypt(plaintext, ENCRYPTION_SECRET_KEY).toString();
        
        // Return the full CryptoJS ciphertext string, which is required for decryption
        return ciphertext;
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Data encryption failed. Check key/plaintext.");
    }
}

/**
 * Decrypts a ciphertext string using AES-256 with the common secret key.
 * @param ciphertext The encrypted data string retrieved from the blockchain.
 * @returns The original plaintext string.
 */
export function decryptData(ciphertext: string): string {
    if (!ciphertext) return '';
    try {
        // Decrypt the data
        const bytes: WordArray = AES.decrypt(ciphertext, ENCRYPTION_SECRET_KEY);
        
        // Convert the decrypted bytes to the original UTF-8 string
        const plaintext = bytes.toString(Utf8);

        // Check for empty string, which indicates a decryption failure (wrong key, corrupted data)
        if (!plaintext) {
             throw new Error("Decryption returned empty string. Key mismatch or invalid ciphertext.");
        }
        
        return plaintext;
    } catch (error) {
        console.error("Decryption failed for ciphertext:", ciphertext, error);
        // Throw an error that is more visible in the component logic
        throw new Error("Data decryption failed. Please check the encryption key.");
    }
}