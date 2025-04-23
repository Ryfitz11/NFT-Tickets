# NFT Ticketing Platform

Welcome to the **NFT Ticketing Platform**! This decentralized platform allows venue owners to create events and sell tickets as NFTs. It leverages the power of blockchain to provide a secure and transparent way for event organizers to manage ticket sales.

## Features

- **Create Events**: Venue owners can create events with details such as event name, date, and ticket price.
- **Sell Tickets**: Event tickets are tokenized as NFTs, making them unique, secure, and verifiable.
- **Buy Tickets**: Users can purchase event tickets directly through the platform, with payments processed via Ethereum or other supported networks.
- **Withdraw Funds**: Event organizers (owners) can withdraw funds from the contract after the event has taken place.

## Network Deployment

- **Blockchain Network**: Base Network (Layer 2 solution for Ethereum)
- **Network Details**:
  - **Mainnet RPC URL**: [https://base-mainnet.infura.io], chainID: 8453
  - **Testnet**: [https://sepolia.base.org], chainID: 84532

The platform has been deployed on **Base** (an Ethereum Layer 2 network) to ensure fast and cost-effective transactions for ticket purchases and withdrawals.

## Demo Video

Check out the demo video on how to use the platform:  
[Watch the Demo on YouTube](https://www.youtube.com/watch?v=fVsiR9CxX-4)

## How to Use the Platform

### 1. Connect Wallet

To interact with the platform, connect your **MetaMask** wallet.

- Ensure you are connected to the **Base Network** (either mainnet or testnet, depending on your preference).

### 2. Creating an Event

- **Step 1**: As a venue owner, navigate to the "Create Event" page.
- **Step 2**: Enter event details such as:
  - **Event Name** (e.g., "Music Concert")
  - **Event Date** (timestamp for the event)
  - **Total Tickets** (number of tickets available for sale)
  - **Ticket Price** (price per ticket in ETH or USDC)
- **Step 3**: Submit the event to deploy the **EventTicket** contract.

### 3. Purchasing Tickets

- **Step 1**: Browse available events.
- **Step 2**: Select the event you wish to attend.
- **Step 3**: Connect your wallet and purchase a ticket. The payment will be processed through the blockchain, and you will receive a unique NFT ticket in your wallet.

### 4. Withdrawing Funds (Event Owners)

- **Step 1**: After the event takes place, navigate to the "My Events" section.
- **Step 2**: As the event organizer, you can withdraw the proceeds from the ticket sales to your connected wallet.

## Installation and Setup (For Developers)

### Prerequisites

- Node.js (v16 or higher)
- npm
- MetaMask
- Base Network RPC URL (for testing and deployment)

### Steps to Set Up Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Ryfitz11/NFT-Tickets.git
   cd NFT-Tickets

    Install dependencies:
   ```

npm install
