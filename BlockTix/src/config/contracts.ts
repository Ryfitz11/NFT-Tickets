import EventTicketFactoryABIJson from "./abis/EventTicketFactory.json";
import EventTicketABIJson from "./abis/EventTicket.json";
import IERC20ABIJson from "./abis/IERC20.json"; // For the Base Sepolia USDC

// Environment variables (ensure these are set in your .env file for Vite)
const VITE_EVENT_TICKET_FACTORY_ADDRESS =
  import.meta.env.VITE_EVENT_TICKET_FACTORY_ADDRESS || "";
const VITE_USDC_TOKEN_ADDRESS =
  import.meta.env.VITE_USDC_TOKEN_ADDRESS ||
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Defaulting to known Base Sepolia USDC
const VITE_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "84532"; // Default to Base Sepolia
const VITE_NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || "Base Sepolia";
const VITE_BASE_SEPOLIA_RPC_URL =
  import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"; // Default public RPC
export const PINATA_GATEWAY_URL =
  import.meta.env.VITE_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

export const CONTRACT_ADDRESSES = {
  eventTicketFactory: VITE_EVENT_TICKET_FACTORY_ADDRESS,
  usdcToken: VITE_USDC_TOKEN_ADDRESS,
} as const;

export const TARGET_NETWORK_CHAIN_ID = parseInt(VITE_CHAIN_ID, 10);

export const TARGET_NETWORK = {
  chainId: TARGET_NETWORK_CHAIN_ID, // e.g., 84532 for Base Sepolia
  hexChainId: `0x${TARGET_NETWORK_CHAIN_ID.toString(16)}`, // e.g., '0x14a34'
  name: VITE_NETWORK_NAME,
  rpcUrl: VITE_BASE_SEPOLIA_RPC_URL,
  blockExplorerUrl: "https://sepolia.basescan.org", // Base Sepolia explorer
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
} as const;

// Exporting ABIs
export const EventTicketFactoryABI = EventTicketFactoryABIJson.abi;
export const EventTicketABI = EventTicketABIJson.abi;
export const UsdcTokenABI = IERC20ABIJson.abi;

// Log for debugging during development (optional, can be removed in production)
if (import.meta.env.DEV) {
  console.log("Contract Config Loaded:", {
    CONTRACT_ADDRESSES,
    TARGET_NETWORK,
    PINATA_GATEWAY_URL,
  });
  if (!VITE_EVENT_TICKET_FACTORY_ADDRESS) {
    console.warn(
      "VITE_EVENT_TICKET_FACTORY_ADDRESS is not set in .env file. Frontend might not connect to the factory contract."
    );
  }
}
