# NFT Ticketing Platform

Welcome to the **NFT Ticketing Platform**! This decentralized platform allows venue owners to create events and sell tickets as NFTs. It leverages the power of blockchain to provide a secure and transparent way for event organizers to manage ticket sales.

## Features

- **Create Events**: Venue owners can create events with details such as event name, date, and ticket price.
- **Sell Tickets**: Event tickets are tokenized as NFTs, making them unique, secure, and verifiable.
- **Buy Tickets**: Users can purchase event tickets directly through the platform, with payments processed via blockchain.
- **Cancel Event**: Event creators can cancel an event before its date, automatically refunding all ticket purchasers.
- **Withdraw Funds**: Event organizers can withdraw proceeds from ticket sales after the event has taken place.

## Network Deployment

This platform is currently deployed to **Base Sepolia** (an Ethereum Layer 2 testnet).

| Network      | RPC URL                  | Chain ID |
| ------------ | ------------------------ | -------- |
| Base Sepolia | https://sepolia.base.org | 84532    |

## Demo Video

Watch the demo on [YouTube](https://youtu.be/C047T_j_to4?si=hmLvtVrrCBtwTFxD)

## How to Use the Platform

### 1. Connect Wallet

- Install **MetaMask** and connect to **Base Sepolia** network.

### 2. Create an Event

1. Navigate to **Create Event**.
2. Fill in:
   - **Event Name** (e.g., "Live Music!")
   - **Contract Name** (required for ERC721)
   - **Symbol** (required for ERC721)
   - **Event Date** (UNIX timestamp)
   - **Total Tickets** (Maximum tickets sold)
   - **Ticket Limit** (Minimize scalping)
   - **Ticket Price** (in ETH)
3. Submit to deploy an `EventTicket` contract.

### 3. Purchase Tickets

1. Browse available events.
2. Select an event.
3. Approve transaction in MetaMask to buy a ticket. Your NFT ticket will appear in your wallet.

### 4. Cancel Event

1. Navigate to **My Events**.
2. Select the event you wish to cancel (before the event date).
3. Confirm cancellation. All ticket purchasers will be able to recieve a refund in the app.

### 5. Withdraw Funds (Event Organizers)

1. After the event date, navigate to **My Events**.
2. Click **Withdraw** to transfer funds to your wallet.

## Features Coming Soon

- **USDC Stablecoin Support**: Pay and receive refunds in USDC.
- **IPFS Metadata Storage**: Decentralized storage for ticket metadata.
- **Mobile Optimization**: Improved UI/UX for mobile devices.

## Installation and Setup

### Prerequisites

- Node.js (v16+)
- npm
- MetaMask
- **Base Sepolia** RPC URL

### Local Setup

```bash
git clone https://github.com/Ryfitz11/NFT-Tickets.git
cd NFT-Tickets
npm install
```

1. Copy `.env.example` to `.env` and update it with your Supabase credentials:

```env
VITE_SUPABASE_URL=<YOUR_SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

2. Run the app:

```bash
npm start
```
