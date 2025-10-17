// src/components/Header.tsx

import React from 'react';
import { cn } from '@/lib/utils'; // Utility for merging Tailwind classes
import WalletConnectButton from './auth/WalletConnectButton'; // The Manager's connection UI

const Header: React.FC = () => {
    
  const handleScrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-gray-800",
      "bg-black/90 backdrop-blur-sm transition-all duration-300"
    )}>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Logo/Name */}
        <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-2xl font-bold tracking-tighter text-cyan-400">
            $DAG$ Ledger
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline-block">
            / Decentralized Records System
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
          <button onClick={() => handleScrollToSection('features')} className="hover:text-cyan-400 transition-colors">Features</button>
          <button onClick={() => handleScrollToSection('staff-login')} className="hover:text-cyan-400 transition-colors">Staff Login</button>
          <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
        </nav>

        {/* Wallet Connection / Manager Login */}
        {/* This button handles the real MetaMask connection and displays status */}
        <WalletConnectButton /> 
      </div>
    </header>
  );
};

export default Header;