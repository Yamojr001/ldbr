// src/context/StaffAuthContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type StaffRole = 'Sales Manager' | 'Inventory Manager' | null;

interface StaffAuthState {
    isAuthenticated: boolean;
    username: string | null;
    walletAddress: string | null; // The associated wallet address
    role: StaffRole;
    login: (username: string, address: string, role: StaffRole) => void;
    logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthState | undefined>(undefined);

export const useStaffAuth = () => {
    const context = useContext(StaffAuthContext);
    if (context === undefined) {
        throw new Error('useStaffAuth must be used within a StaffAuthProvider');
    }
    return context;
};

export const StaffAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState({
        isAuthenticated: false,
        username: null,
        walletAddress: null,
        role: null,
    });

    const login = (username: string, address: string, role: StaffRole) => {
        setState({
            isAuthenticated: true,
            username,
            walletAddress: address,
            role,
        });
    };

    const logout = () => {
        setState({
            isAuthenticated: false,
            username: null,
            walletAddress: null,
            role: null,
        });
    };

    const contextValue = {
        ...state,
        login,
        logout,
    };

    return (
        <StaffAuthContext.Provider value={contextValue}>
            {children}
        </StaffAuthContext.Provider>
    );
};