import { BrowserProvider } from 'ethers';

export interface Event {
  id: string;
  name: string;
  date: Date;
  totalTickets: number;
  ticketsSold: number;
  price: string;
  imageUrl: string;
  description: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  owner: string;
  price: string;
  forSale: boolean;
}

export interface WalletState {
  provider: BrowserProvider | null;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface FormData {
  eventName: string;
  name: string;
  symbol: string;
  date: string;
  totalTickets: string;
  ticketPrice: string;
  ticketLimit: string;
  imageUrl: string;
  description: string;
}