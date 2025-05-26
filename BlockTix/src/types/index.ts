export interface Ticket {
  id: string;
  eventName: string;
  venue: string;
  date: string;
  price: string;
  imageUrl: string;
  description: string;
  owner?: string;
  eventAddress: string;
}

export interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  price: string;
  imageUrl: string;
  description: string;
  totalTickets: number;
  availableTickets: number;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface ContractAddresses {
  eventTicketFactory: string;
  mockUSDC: string;
}