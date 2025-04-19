import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export function WalletConnect() {
  const { address, balance, isConnecting, error, connect, disconnect } = useWallet();

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
        {error}
      </div>
    );
  }

  if (address) {
    return (
      <div className="inline-flex items-center space-x-2 bg-white rounded-md border border-gray-200 pr-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
          <p className="text-xs text-gray-500">{`${Number(balance).toFixed(4)} ETH`}</p>
        </div>
        <button
          onClick={disconnect}
          className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-700 focus:outline-none"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}