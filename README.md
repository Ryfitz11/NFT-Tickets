# BlockTix - Decentralized NFT Ticketing Platform

Welcome to **BlockTix**! This decentralized application (DApp) empowers venue owners and event organizers to create events and sell tickets as NFTs on the blockchain (currently targeting Base Sepolia). BlockTix leverages smart contracts to provide a secure, transparent, and efficient way to manage ticket sales and event experiences.

The platform offers a user-friendly interface for:

- **General Users:** To browse events, view comprehensive details, connect their Web3 wallets (like MetaMask), purchase NFT tickets using USDC, and manage their ticket collections.
- **Venue Owners/Organizers:** To create new ticketed events (including uploading event imagery to IPFS via Pinata), manage their events (cancel, withdraw funds, etc.), and utilize administrative functions for their deployed `EventTicket` contracts.

## Demo Video

Watch the demo on [YouTube](https://youtu.be/C047T_j_to4?si=hmLvtVrrCBtwTFxD) _(Note: Please update this link if it's different)_

## Deployed Network

BlockTix is currently deployed and configured for the **Base Sepolia** test network.

| Network      | RPC URL                  | Chain ID (Decimal) | Chain ID (Hex) |
| :----------- | :----------------------- | :----------------- | :------------- |
| Base Sepolia | https://sepolia.base.org | 84532              | 0x14A34        |

## Features

### For General Users:

- **Connect Web3 Wallet:** Seamlessly connect wallets like MetaMask.
- **Network Detection:** Automatically detects if the user is on the correct network (Base Sepolia) and prompts to switch if necessary.
- **Browse Events:** Discover available events on the Event Listings Page, displayed in a responsive grid.
- **View Event Details:** Access comprehensive information for each event/ticket on its dedicated details page.
- **Purchase NFT Tickets:** Buy tickets using USDC, including the standard ERC20 approval flow.
- **Manage Owned Tickets:** View all purchased BlockTix NFT tickets on the "My Tickets" page.
- **Claim Refunds:** If an event is canceled by the organizer, users can claim their USDC refund for tickets they originally purchased.

### For Venue Owners/Event Organizers:

- **Create New Events:** Utilize a dedicated interface (Venue Dashboard) to define and launch new ticketed events.
  - Input NFT collection details (name, symbol), event specifics (name, date, total tickets, price in USDC, ticket limit).
  - **IPFS Image Upload:** Upload event-specific images, which are securely pinned to IPFS via Pinata (handled by a backend service to protect API keys). The IPFS path is stored on-chain.
  - Deploy a unique `EventTicket.sol` contract for each event via the `EventTicketFactory.sol`.
- **Manage Created Events:**
  - **Cancel Event:** Cancel an event before its scheduled date (enables refunds for buyers).
  - **Withdraw Funds:** Withdraw USDC proceeds from ticket sales after the event concludes (if not canceled).
  - **Set Base URI:** Update the metadata base URI for the NFT collection.
  - **Set Ticket Limit:** Modify the maximum number of tickets a single address can purchase.
  - **Mark Tickets as Used:** Designate tickets as "used" (e.g., for event entry).
- **Dark Mode:** User-toggleable dark mode for improved visibility, with preference persistence.
- **Responsive Design:** Fully responsive interface for desktop, tablet, and mobile devices.

## Technology Stack

- **Frontend:** React (with TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Redux / Redux Toolkit
- **Blockchain Interaction:** Ethers.js
- **Routing:** React Router DOM
- **Smart Contracts:** Solidity
  - `EventTicketFactory.sol`: For creating and tracking event contracts.
  - `EventTicket.sol`: ERC721-compliant contract for individual events and NFT tickets.
  - USDC (ERC20): For payments (using MockUSDC for dev/test or official USDC).
- **IPFS Storage (Event Imagery):** Pinata (interaction managed via a secure backend service).
- **Backend Service (for Pinata):** e.g., Node.js/Express, Python/Flask, or Serverless Functions (to securely handle Pinata API keys).

## Key Smart Contracts

- **`EventTicketFactory.sol`**: The central contract used by venue owners to deploy new `EventTicket.sol` contracts.
  - _ABI:_ `src/contracts/abis/EventTicketFactory.json`
  - _Key Functions:_ `createEvent()`, `getAllEventAddresses()`
- **`EventTicket.sol`**: An ERC721 contract instance representing a single event, managing its NFT tickets, sales, and lifecycle.
  - _ABI:_ `src/contracts/abis/EventTicket.json`
  - _Key Functions:_ `buyTicket()`, `cancelEvent()`, `claimRefund()`, `withdrawFunds()`, `setBaseURI()`, `markTicketAsUsed()`, various getters.

## How to Use the Platform

### Initial Setup (All Users)

1.  **Install MetaMask:** Ensure you have the MetaMask browser extension installed.
2.  **Connect to Base Sepolia:** Configure MetaMask to connect to the Base Sepolia network:
    - Network Name: Base Sepolia
    - RPC URL: `https://sepolia.base.org`
    - Chain ID: `84532` (or `0x14A34`)
    - Currency Symbol: ETH
3.  **Acquire Base Sepolia ETH:** Obtain test ETH for gas fees from a Base Sepolia faucet.
4.  **Acquire Mock USDC (for testing):** If using a MockUSDC contract for testing on Base Sepolia, you may need to mint test USDC tokens to your wallet.

### General Users

1.  **Connect Wallet:** Click the "Connect Wallet" button on the BlockTix platform and approve the connection in MetaMask.
2.  **Browse Events:** Navigate to the "Event Listings" page to see available events.
3.  **View Event Details:** Click on an event card to see more details.
4.  **Purchase a Ticket:**
    - On the event details page, click "Buy Ticket."
    - **Approve USDC:** First, you'll be prompted by MetaMask to approve the specific EventTicket contract to spend your USDC for the ticket price. Confirm this transaction.
    - **Confirm Purchase:** After the approval is confirmed, you'll be prompted by MetaMask again to confirm the actual ticket purchase transaction (`buyTicket()`).
    - Your NFT ticket will be minted to your wallet upon success.
5.  **View Your Tickets:** Go to the "My Tickets" page to see all your BlockTix NFTs.
6.  **Claim Refund (for Canceled Events):** If an event you bought a ticket for is canceled, navigate to the event page or your "My Tickets" page and use the "Claim Refund" option.

### Venue Owners / Event Organizers

1.  **Connect Wallet:** Ensure your wallet (with deployment/ownership privileges) is connected.
2.  **Navigate to Venue Dashboard:** Access your dedicated dashboard for event management.
3.  **Create an Event:**
    - Fill out the event creation form with all required details (NFT name/symbol, event name, date, total tickets, price in USDC, ticket limit per user, USDC contract address).
    - Upload an event image. This image will be sent to a backend service and pinned to IPFS via Pinata. The IPFS path will be automatically populated.
    - Submit the form. This will trigger a transaction to `EventTicketFactory.createEvent()`. Approve it in MetaMask.
4.  **Manage Your Events:** From the dashboard, you can:
    - View details of events you've created.
    - **Cancel Event:** If an event needs to be canceled (before its date).
    - **Withdraw Funds:** After a successful event, withdraw the USDC collected from sales.
    - Perform other administrative actions like `setBaseURI`, `setTicketLimit`, or `markTicketAsUsed`.

## Local Development Setup

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MetaMask browser extension

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Ryfitz11/NFT-Tickets.git](https://github.com/Ryfitz11/NFT-Tickets.git) # (Update URL if different)
    cd NFT-Tickets
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Set up Environment Variables:**
    Copy the `.env.example` file (if provided in your project) to a new file named `.env` and fill in the necessary values:

    ```env
    REACT_APP_EVENT_TICKET_FACTORY_ADDRESS=<YOUR_EVENT_TICKET_FACTORY_ADDRESS_ON_BASE_SEPOLIA>
    REACT_APP_USDC_TOKEN_ADDRESS=<YOUR_USDC_TOKEN_ADDRESS_ON_BASE_SEPOLIA> # (Mock or Official)
    REACT_APP_TARGET_CHAIN_ID=0x14A34 # Base Sepolia Chain ID in Hex
    REACT_APP_RPC_URL=[https://sepolia.base.org](https://sepolia.base.org)
    REACT_APP_IPFS_GATEWAY_URL=[https://gateway.pinata.cloud/ipfs/](https://gateway.pinata.cloud/ipfs/) # Or your preferred gateway
    REACT_APP_BACKEND_API_URL=<YOUR_BACKEND_SERVICE_URL_FOR_PINATA_UPLOADS>

    # If you are still using Supabase for any backend features, include these:
    # VITE_SUPABASE_URL=<YOUR_SUPABASE_URL>
    # VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
    ```

    _Ensure your backend service for Pinata uploads is running and its URL is correctly set in `REACT_APP_BACKEND_API_URL`._
    _The backend service will require its own environment variables for `PINATA_API_KEY` and `PINATA_API_SECRET` and must **not** be exposed in the frontend._

4.  **Run the development server:**
    ```bash
    npm start
    # or
    # yarn start
    ```
    The application should now be running on `http://localhost:3000` (or another port if configured differently).

## Future Enhancements

- **Enhanced Mobile Optimization:** Further improvements to UI/UX specifically for mobile devices.
- **Secondary Marketplace:** Functionality for users to list and sell their purchased tickets to others.
- **Advanced Event Filtering & Sorting:** More granular options for users Browse events.
- **On-Chain Allowlist for Venue Owners:** A more robust system for managing who can create events.
- **Full IPFS Metadata for NFTs:** Beyond just the image, storing complete NFT metadata JSON on IPFS via the `setBaseURI` functionality.

## Contributing

_(Optional: Add guidelines if you wish for others to contribute)_

## License

_(Optional: Specify a license, e.g., MIT)_
