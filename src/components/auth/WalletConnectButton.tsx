// src/components/auth/WalletConnectButton.tsx (FINAL CODE)

import React from 'react';
import { Button } from '../ui/button';
import { Wallet, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import useWalletStatus from '@/hooks/useWalletStatus'; // FIX: Use the combined hook

const WalletConnectButton: React.FC = () => {
  // FIX: Destructure from the single, stable combined hook
  const { 
    isConnected, address, connectWallet, disconnectWallet, 
    error, isManager, isLoadingAuth 
  } = useWalletStatus(); 

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isLoadingAuth) {
    return (
        <Button disabled variant="outline" className="text-cyan-400 border-cyan-400 bg-gray-900">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
        </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <span className={cn(
            "px-3 py-1 text-sm font-semibold rounded-full",
            isManager ? "bg-green-900/40 text-green-300 border border-green-500/50" : "bg-red-900/40 text-red-300 border border-red-500/50"
        )}>
            {isManager ? "MANAGER" : "UNAUTHORIZED"}
        </span>
        <Button onClick={disconnectWallet} variant="ghost" className="text-gray-400 hover:text-white border-gray-700 hover:bg-gray-800">
          {shortAddress} / Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button 
        onClick={connectWallet}
        variant="outline" 
        className={cn(
          "text-cyan-400 border-cyan-400 font-semibold",
          "hover:bg-cyan-900/20 hover:text-cyan-200 transition-colors"
        )}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Manager Wallet
      </Button>
      {error && (
        <p className="text-xs text-red-400 absolute top-full right-0 mt-1 max-w-[200px] text-right">
            <AlertTriangle className="inline h-3 w-3 mr-1" />{error.includes('rejected') ? 'Connection Rejected' : 'Install MetaMask'}
        </p>
      )}
    </div>
  );
};

export default WalletConnectButton;