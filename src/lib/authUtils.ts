// src/lib/authUtils.ts (OFF-CHAIN HASHING/STORAGE SIMULATION)

import sha256 from 'crypto-js/sha256';

// Key: address -> Value: SHA256 Hash of their Passkey
const PASSKEY_VAULT: { [key: string]: string } = {};
const DEFAULT_PASSKEY_STRING = 'privetekey';
const DEFAULT_PASSKEY_HASH = sha256(DEFAULT_PASSKEY_STRING).toString();

// --- SECURITY FUNCTIONS ---

const hashPasskey = (passkey: string): string => {
    return sha256(passkey).toString();
};

export const getPasskeyHash = (identifier: string): string | null => {
    const key = identifier.toLowerCase();
    return PASSKEY_VAULT[key] || DEFAULT_PASSKEY_HASH; 
};

export const verifyPasskey = (identifier: string, passkey: string): boolean => {
    const storedHash = getPasskeyHash(identifier);
    if (!storedHash) return false;
    return hashPasskey(passkey) === storedHash;
};

export const setPasskey = (identifier: string, newPasskey: string): void => {
    const key = identifier.toLowerCase();
    PASSKEY_VAULT[key] = hashPasskey(newPasskey);
};

// FIX: Export setDefaultPasskey and isDefaultPasskey explicitly
export const setDefaultPasskey = (identifier: string): void => { // <-- EXPORTED
    const key = identifier.toLowerCase();
    PASSKEY_VAULT[key] = DEFAULT_PASSKEY_HASH;
};

export const isDefaultPasskey = (identifier: string): boolean => { // <-- EXPORTED
    const storedHash = PASSKEY_VAULT[identifier.toLowerCase()];
    return !storedHash || storedHash === DEFAULT_PASSKEY_HASH;
};