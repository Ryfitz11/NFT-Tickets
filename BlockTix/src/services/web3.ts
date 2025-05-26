import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import EventTicketFactoryABI from '../contracts/abis/EventTicketFactory.json';
import EventTicketABI from '../contracts/abis/EventTicket.json';
import { CONTRACT_ADDRESSES, TARGET_NETWORK } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface CreateEventParams {
  erc721Name: string;
  erc721Symbol: string;
  eventName: string;
  date: number;
  totalTickets: number;
  ticketPriceInUSDC: number;
  ticketLimit: number;
  usdcTokenAddress: string;
  eventImageIPFSPath: string;
}

export class Web3Service {
  private static provider: BrowserProvider | null = null;
  private static signer: JsonRpcSigner | null = null;
  private static factoryContract: Contract | null = null;

  static async initialize(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    this.factoryContract = new Contract(
      CONTRACT_ADDRESSES.eventTicketFactory,
      EventTicketFactoryABI.abi,
      this.signer
    );
  }

  static async getSigner(): Promise<JsonRpcSigner> {
    if (!this.signer) {
      throw new Error('Web3 not initialized');
    }
    return this.signer;
  }

  static async connectWallet(): Promise<{ address: string; chainId: number }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    return { address, chainId };
  }

  static async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${TARGET_NETWORK.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${TARGET_NETWORK.chainId.toString(16)}`,
              chainName: TARGET_NETWORK.name,
              rpcUrls: [TARGET_NETWORK.rpcUrl],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  static async getAllEventAddresses(): Promise<string[]> {
    if (!this.factoryContract) {
      throw new Error('Factory contract not initialized');
    }

    return await this.factoryContract.getAllEventAddresses();
  }

  static async createEvent(params: CreateEventParams): Promise<void> {
    if (!this.factoryContract) {
      throw new Error('Factory contract not initialized');
    }

    const tx = await this.factoryContract.createEvent(
      params.erc721Name,
      params.erc721Symbol,
      params.eventName,
      params.date,
      params.totalTickets,
      params.ticketPriceInUSDC,
      params.ticketLimit,
      params.usdcTokenAddress,
      params.eventImageIPFSPath
    );

    await tx.wait();
  }

  static getEventContract(address: string): Contract {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    return new Contract(address, EventTicketABI.abi, this.signer);
  }

  static async getEventDetails(eventAddress: string) {
    const eventContract = this.getEventContract(eventAddress);
    const details = await eventContract.getEventDetails();
    const imagePath = await eventContract.getEventImageIPFSPath();

    return {
      name: details.eventName,
      date: new Date(Number(details.eventDate) * 1000),
      totalTickets: Number(details.totalEventTickets),
      soldTickets: Number(details.soldEventTickets),
      isCanceled: details.isEventCanceled,
      imageUrl: `https://ipfs.io/ipfs/${imagePath}`,
    };
  }
}