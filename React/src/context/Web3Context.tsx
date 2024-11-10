import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import EventTicketFactory from '../../contract/EventTicketFactory.json';
import EventTicket from '../../contract/EventTicket.json';

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  contract: ethers.Contract | null;
  factoryContract: ethers.Contract | null;
  provider: ethers.Provider | null;
  isConnected: boolean;
  deployEventContract: (name: string, date: number, totalTickets: number, ticketPrice: string) => Promise<string>;
  loadEventContract: (address: string) => Promise<void>;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  connectWallet: async () => {},
  contract: null,
  factoryContract: null,
  provider: null,
  isConnected: false,
  deployEventContract: async () => '',
  loadEventContract: async () => {},
  isConnecting: false,
});

const FACTORY_ADDRESS = 'YOUR_FACTORY_CONTRACT_ADDRESS';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [factoryContract, setFactoryContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // Check if already connected
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            handleAccountsChanged([accounts[0].address]);
          }
        } catch (error) {
          console.error('Error checking initial accounts:', error);
        }
      }
    };

    initProvider();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setContract(null);
      setFactoryContract(null);
      toast.error('Wallet disconnected');
    } else {
      setAccount(accounts[0]);
      await initializeContracts(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const initializeContracts = async (userAccount: string) => {
    if (!provider) return;

    try {
      const signer = await provider.getSigner(userAccount);
      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        EventTicketFactory.abi,
        signer
      );
      setFactoryContract(factory);
    } catch (error) {
      console.error('Error initializing contracts:', error);
      toast.error('Failed to initialize contracts');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error(
        'MetaMask not detected! Please install MetaMask to use this feature',
        { duration: 5000 }
      );
      return;
    }

    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      await handleAccountsChanged(accounts);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Please approve the connection request in your wallet');
      } else if (error.code === -32002) {
        toast.error('Connection request already pending. Please check your wallet');
      } else {
        toast.error('Failed to connect wallet. Please try again');
        console.error('Wallet connection error:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const deployEventContract = async (
    name: string,
    date: number,
    totalTickets: number,
    ticketPrice: string
  ) => {
    if (!factoryContract) throw new Error('Factory contract not initialized');

    try {
      const tx = await factoryContract.deployEventContract(
        name,
        date,
        totalTickets,
        ethers.parseEther(ticketPrice)
      );
      
      toast.loading('Deploying event contract. Please confirm the transaction...');
      const receipt = await tx.wait();
      
      const deployEvent = receipt.logs.find(
        (log: any) => log.eventName === 'EventContractDeployed'
      );
      
      if (!deployEvent) throw new Error('Event contract address not found in transaction logs');
      
      const eventAddress = deployEvent.args[0];
      await loadEventContract(eventAddress);
      
      return eventAddress;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      }
      console.error('Error deploying event contract:', error);
      throw error;
    }
  };

  const loadEventContract = async (address: string) => {
    if (!provider) throw new Error('Provider not initialized');

    try {
      const signer = await provider.getSigner();
      const eventContract = new ethers.Contract(
        address,
        EventTicket.abi,
        signer
      );
      setContract(eventContract);
    } catch (error) {
      console.error('Error loading event contract:', error);
      throw error;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        contract,
        factoryContract,
        provider,
        isConnected: !!account,
        deployEventContract,
        loadEventContract,
        isConnecting,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);