import React, { createContext, useContext, useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import EventTicketFactory from "../contract/EventTicketFactory.json";
import EventTicket from "../contract/EventTicket.json";

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

export interface Web3ContextType {
  account: string | null;
  contract: ethers.Contract | null;
  factoryContract: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  deployEventContract: (
    name: string,
    date: number,
    totalTickets: number,
    ticketPrice: string
  ) => Promise<string>;
  loadEventContract: (address: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const Web3Context = createContext<Web3ContextType | undefined>(
  undefined
);

const FACTORY_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [factoryContract, setFactoryContract] =
    useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const initializeProvider = useCallback(async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      setAccount(accounts[0].address);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        EventTicketFactory.abi,
        signer
      );
      setFactoryContract(factory);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected!");
      return;
    }

    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setProvider(provider);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const signer = await provider.getSigner();
        const factory = new ethers.Contract(
          FACTORY_ADDRESS,
          EventTicketFactory.abi,
          signer
        );
        setFactoryContract(factory);
      }

      toast.success("Wallet connected successfully!");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 4001
      ) {
        toast.error("Please approve the connection request");
      } else {
        toast.error("Failed to connect wallet");
        console.error(error);
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
    if (!factoryContract) throw new Error("Factory contract not initialized");

    const tx = await factoryContract.deployEventContract(
      name,
      date,
      totalTickets,
      ethers.parseEther(ticketPrice)
    );

    const receipt = await tx.wait();
    const deployEvent = receipt.logs.find((log: ethers.Log) => {
      const parsedLog = factoryContract.interface.parseLog(log);
      return parsedLog?.name === "EventContractDeployed";
    });

    if (!deployEvent) throw new Error("Event contract address not found");
    const eventAddress = deployEvent.args[0];
    await loadEventContract(eventAddress);
    return eventAddress;
  };

  const loadEventContract = async (address: string) => {
    if (!provider) throw new Error("Provider not initialized");
    const signer = await provider.getSigner();
    const eventContract = new ethers.Contract(address, EventTicket.abi, signer);

    // Verify the contract is deployed at this address
    try {
      await eventContract.getEventDetails(); // Test call to verify contract
      setContract(eventContract);
    } catch (error) {
      console.error("Error loading contract:", error);
      throw new Error("Invalid contract address or contract not deployed");
    }
  };

  React.useEffect(() => {
    initializeProvider();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setContract(null);
          setFactoryContract(null);
        } else {
          setAccount(accounts[0]);
          initializeProvider();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [initializeProvider]);

  const value = {
    account,
    contract,
    factoryContract,
    provider,
    isConnected: !!account,
    isConnecting,
    connectWallet,
    deployEventContract,
    loadEventContract,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
