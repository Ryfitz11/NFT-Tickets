import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { SUPPORTED_CHAIN_ID } from '../contracts/config';
import { toast } from 'react-hot-toast';
import { WalletState } from '../types';

const initialState: WalletState = {
  provider: null,
  address: null,
  balance: null,
  isConnecting: false,
  error: null,
};

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  const checkNetwork = async (provider: BrowserProvider) => {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    if (chainId !== SUPPORTED_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}` }],
        });
        return true;
      } catch (error: any) {
        if (error.code === 4902) {
          toast.error('Please add Base Sepolia network to MetaMask');
        } else {
          toast.error('Please switch to Base Sepolia network');
        }
        return false;
      }
    }
    return true;
  };

  const updateWalletState = useCallback(async (showToast = false) => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const balance = await provider.getBalance(accounts[0].address);
        const newAddress = accounts[0].address;
        
        setState(prev => {
          // Only show toast if address changed and we're asked to show it
          if (showToast && prev.address && prev.address.toLowerCase() !== newAddress.toLowerCase()) {
            toast.success('Account changed');
          }
          
          return {
            provider,
            address: newAddress,
            balance: formatEther(balance),
            isConnecting: false,
            error: null,
          };
        });
      } else {
        setState(initialState);
      }
    } catch (error: any) {
      console.error('Error updating wallet state:', error);
      setState(initialState);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'Please install MetaMask!' }));
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      const provider = new BrowserProvider(window.ethereum);
      
      const isCorrectNetwork = await checkNetwork(provider);
      if (!isCorrectNetwork) {
        setState(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const balance = await provider.getBalance(accounts[0]);
      
      setState({
        provider,
        address: accounts[0],
        balance: formatEther(balance),
        isConnecting: false,
        error: null,
      });

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error(error.message || 'Failed to connect wallet');
      }
    }
  }, [checkNetwork]);

  const disconnect = useCallback(() => {
    setState(initialState);
    toast.success('Wallet disconnected');
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setState(initialState);
          toast.success('Wallet disconnected');
        } else {
          await updateWalletState(true);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Initial connection check without toast
      updateWalletState(false);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [updateWalletState]);

  return { ...state, connect, disconnect };
}