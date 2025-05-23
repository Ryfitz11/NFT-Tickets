# NFT Ticketing System Documentation Plan

## 1. Introduction

- Briefly state the purpose of the document: to explain the `EventTicketFactory.sol` and `EventTicket.sol` smart contracts and guide frontend integration.

## 2. Smart Contract Overview

- **`EventTicketFactory.sol`:**
  - Role: Acts as a deployer for individual `EventTicket` contracts.
  - Mechanism: The `createEvent()` function instantiates new `EventTicket` contracts.
  - Tracking: Maintains a list (`eventContracts`) of all deployed event contract addresses.
  - Notification: Emits an `EventCreated` event upon successful deployment of a new event contract.
- **`EventTicket.sol`:**
  - Role: An ERC721 compliant NFT contract where each token represents a unique ticket to an event.
  - Core Functionalities:
    - Manages detailed event information (name, date, total tickets, tickets sold, cancellation status).
    - Handles ticket sales via USDC (`buyTicket()`).
    - Allows event cancellation by the owner (`cancelEvent()`).
    - Enables users to claim refunds if an event is canceled (`claimRefund()`).
    - Permits the event creator to withdraw funds after the event (`withdrawFunds()`).
    - Supports ticket transfers between users (`transferTicket()`).
    - Allows event organizers to mark tickets as used (`markTicketAsUsed()`).
    - Manages metadata URI for token details (`setBaseURI()`).

## 3. Key Contract Functions

- **`EventTicketFactory.sol`:**
  - `createEvent(string memory _erc721Name, string memory _erc721Symbol, string memory _eventName, uint256 _date, uint256 _totalTickets, uint256 _ticketPriceInUSDC, uint256 _ticketLimit, address _usdcTokenAddress, string memory _eventImageIPFSPath)`:
    - **Usage:** Called by an event organizer to launch a new ticketed event.
    - **Parameters:** Detailed explanation of each parameter's purpose (e.g., `_erc721Name` for the NFT collection name, `_ticketPriceInUSDC` for the price in USDC atomic units).
    - **Actions:** Validates inputs, deploys a new `EventTicket` contract, stores its address, and emits the `EventCreated` event with event details.
  - `getAllEventAddresses()`:
    - **Purpose:** Returns an array containing the addresses of all `EventTicket` contracts created by the factory. Essential for frontends to discover and list available events.
- **`EventTicket.sol`:**
  - `constructor(string memory _erc721Name, string memory _erc721Symbol, string memory _eventName, uint256 _date, uint256 _totalTickets, uint256 _ticketPriceInUSDC, uint256 _ticketLimit, address _usdcTokenAddress, string memory _eventImageIPFSPath, address initialOwner)`:
    - **Parameters & Initialization:** Sets up the ERC721 token (name, symbol), event-specific details (`eventDetails` struct), `ticketPrice`, `ticketLimit` per buyer, the `usdcToken` contract interface, `eventImageIPFSPath`, and assigns contract ownership.
  - `buyTicket()`:
    - **Process:**
      1.  Verifies event status (not canceled, not past, tickets available, buyer within limit).
      2.  Ensures no ETH is sent (USDC payment only).
      3.  Checks if the `EventTicket` contract has sufficient USDC allowance from the buyer (`usdcToken.allowance()`).
      4.  Transfers `ticketPrice` in USDC from the buyer to the contract (`usdcToken.transferFrom()`).
      5.  Mints a new NFT ticket to the buyer (`_mint()`).
      6.  Updates `eventDetails.ticketsSold` and `ticketsBought[msg.sender]`.
  - `cancelEvent()`:
    - **Purpose:** Allows the contract owner (event creator) to cancel the event.
    - **Implications:** Sets `eventDetails.isCanceled` to `true`, emits `EventCanceled` event. This action typically enables refunds and halts other operations like buying or transferring tickets.
  - `claimRefund()`:
    - **Process:**
      1.  Allows users to claim a refund if `eventDetails.isCanceled` is `true`.
      2.  Checks that the user hasn't already claimed a refund (`hasRefunded[msg.sender]`).
      3.  Refunds are based on `ticketsBought[msg.sender]`, meaning the original purchaser receives the refund.
      4.  Transfers the appropriate USDC amount back to the user.
      5.  Emits `RefundClaimed` event.
  - `withdrawFunds()`:
    - **Purpose:** Allows the contract owner to withdraw the collected USDC funds.
    - **Conditions:** Typically called after the event date has passed and if the event was not canceled.
  - `transferTicket(uint256 ticketId, address to)`:
    - **Purpose:** Allows the current owner of a ticket (NFT) to transfer it to another address.
    - **Conditions:** Event not canceled, sender owns the ticket, ticket not used.
  - `markTicketAsUsed(uint256 ticketId)`:
    - **Purpose:** Allows the contract owner to mark a specific ticket as used (e.g., upon entry to the event).
    - **Conditions:** Event not canceled, ticket exists and is owned, ticket not already used. Emits `TicketMarkedAsUsed`.
  - `setBaseURI(string memory baseURI_)`:
    - **Purpose:** Allows the contract owner to set the base URI for the ERC721 token metadata. This URI is used by wallets/marketplaces to fetch details (name, description, image) for each ticket NFT (e.g., `ipfs://<CID_for_metadata_folder>/`).
  - `setTicketLimit(uint256 newLimit)`:
    - **Purpose:** Allows the contract owner to change the maximum number of tickets a single address can purchase.
  - **Getter Functions:**
    - A summary of important view functions for retrieving data:
      - `getEventDetails()`: Returns comprehensive details about the event.
      - `getTicketStatus(uint256 ticketId)`: Checks if a ticket has been marked as used.
      - `getEventImageIPFSPath()`: Returns the IPFS path for the event's image.
      - `isTicketOwner(address user, uint256 ticketId)`: Verifies ticket ownership.
      - `getUserTickets(address user)`: Returns a list of ticket IDs owned by a user.
      - `getRefundStatus(address user)`: Checks if a user has claimed a refund.
      - Public state variables like `ticketPrice`, `ticketLimit`, `eventDetails`, `usdcToken` (address), `nextTicketId`.

## 4. Frontend Integration Guide

- **Setup:**
  - Connecting to an Ethereum provider (e.g., MetaMask via `window.ethereum` or libraries like Ethers.js/Web3.js).
  - Loading Contract ABIs: Using the JSON ABI files generated during compilation (e.g., for `EventTicketFactory`, `EventTicket`, `MockUSDC`).
  - Contract Addresses: Obtaining the deployed `EventTicketFactory` address and dynamically fetching `EventTicket` addresses.
- **Event Creation:**
  - Instantiating the `EventTicketFactory` contract.
  - Calling `EventTicketFactory.createEvent()` with user-provided parameters, handling the transaction.
- **Displaying Events:**
  - Calling `EventTicketFactory.getAllEventAddresses()` to get a list of event contract addresses.
  - For each `EventTicket` address: Instantiate the contract and use its getter functions (`getEventDetails()`, `ticketPrice()`, etc.) to fetch and display event information.
- **Buying Tickets:**
  - **Step 1: USDC Approval:** The user must first approve the specific `EventTicket` contract to spend their USDC. This involves:
    - Instantiating the `MockUSDC` (or actual USDC) contract.
    - Calling `approve(eventTicketContractAddress, totalTicketPriceInUSDC)` from the user's account.
  - **Step 2: Purchasing Ticket:**
    - Instantiating the `EventTicket` contract.
    - Calling `EventTicket.buyTicket()`, handling the transaction.
- **Event Management (for Event Creators/Owners):**
  - Interacting with `EventTicket` contract functions (as owner): `setBaseURI()`, `setTicketLimit()`, `cancelEvent()`, `withdrawFunds()`, `markTicketAsUsed()`.
- **User Ticket Management:**
  - `claimRefund()`: If an event is canceled.
  - `transferTicket()`: To send a ticket to another user.
  - Displaying Owned Tickets: Use `getUserTickets()` to find ticket IDs, then `tokenURI()` (if metadata is set up) and `getTicketStatus()` for details.
- **Listening to Contract Events:**
  - How to subscribe to events (e.g., using Ethers.js `contract.on("EventName", callback)`):
    - `EventCreated` (from `EventTicketFactory`).
    - `TicketMarkedAsUsed`, `EventCanceled`, `RefundClaimed` (from `EventTicket`).
  - Using these events to update the UI dynamically.
- **Error Handling:**
  - Common errors: User rejecting transactions, insufficient funds (for gas or USDC), contract `require` failures (e.g., "All tickets sold", "USDC allowance insufficient"), network issues.
  - Best practices for presenting errors clearly to the user.

## 5. Important Considerations

- **Gas Fees:** Explain that all transactions (state changes) on Ethereum require gas, paid in ETH. View functions are free.
- **Transaction Confirmation Times:** Blockchain transactions are not instant. Discuss how to handle pending, confirmed, and failed transaction states in the UI.
- **Security Best Practices for Frontend:**
  - Never handle private keys in the frontend; rely on wallet providers.
  - Validate user inputs.
  - Clearly communicate to the user what actions they are signing/approving.
  - Be aware of potential phishing risks.
- **Role of `MockUSDC.sol`:**
  - Explain its use for development and testing (easy minting, simulating failures).
  - Contrast with a live USDC token (real value, official contract addresses, standard decimals like 6).

## 6. Contract Interaction Flow (Mermaid Diagram)

```mermaid
graph TD
    subgraph UserInteraction as UI
        direction LR
        U[User]
    end

    subgraph FrontendApp as FE
        direction LR
        App[Frontend DApp]
    end

    subgraph Blockchain
        direction TB
        subgraph FactoryContract [EventTicketFactory]
            direction TB
            FC_Create[createEvent(...)]
            FC_GetAll[getAllEventAddresses()]
            FC_Storage[(eventContracts Array)]
            FC_Event[EventCreated Event]

            FC_Create --> FC_Storage
            FC_Create -- emits --> FC_Event
            FC_GetAll --> FC_Storage
        end

        subgraph EventContractTemplate [EventTicket (Deployed Instance)]
            direction TB
            ET_Constructor[constructor(...)]
            ET_Buy[buyTicket()]
            ET_Cancel[cancelEvent()]
            ET_Refund[claimRefund()]
            ET_Withdraw[withdrawFunds()]
            ET_Transfer[transferTicket()]
            ET_MarkUsed[markTicketAsUsed()]
            ET_SetBaseURI[setBaseURI(...)]
            ET_SetLimit[setTicketLimit(...)]
            ET_Getters[View Functions e.g., getEventDetails()]
            ET_State[(Event State: details, ticketsSold, isCanceled, etc.)]
            ET_Events[Contract Events: TicketMarkedAsUsed, EventCanceled, RefundClaimed]

            ET_Constructor --> ET_State
            ET_Buy --> ET_State
            ET_Cancel --> ET_State
            ET_Cancel -- emits --> ET_Events
            ET_Refund --> ET_State
            ET_Refund -- emits --> ET_Events
            ET_Withdraw --> ET_State
            ET_MarkUsed --> ET_State
            ET_MarkUsed -- emits --> ET_Events
            ET_SetBaseURI --> ET_State
            ET_SetLimit --> ET_State
            ET_Getters --> ET_State
        end

        subgraph USDCToken [USDC Contract (Mock or Real)]
            direction TB
            USDC_Approve[approve(spender, amount)]
            USDC_TransferFrom[transferFrom(from, to, amount)]
            USDC_Transfer[transfer(to, amount)]
        end

        FC_Create -- Deploys --> EventContractTemplate
    end


    U -- Interacts --> App

    App -- Calls --> FC_Create
    App -- Calls --> FC_GetAll
    App -- Reads Event --> FC_Event

    App -- Calls --> USDC_Approve

    App -- Calls --> ET_Buy
    App -- Calls --> ET_Cancel
    App -- Calls --> ET_Refund
    App -- Calls --> ET_Withdraw
    App -- Calls --> ET_Transfer
    App -- Calls --> ET_MarkUsed
    App -- Calls --> ET_SetBaseURI
    App -- Calls --> ET_SetLimit
    App -- Calls --> ET_Getters
    App -- Reads Events --> ET_Events


    ET_Buy -- Requires Approval & Calls --> USDC_TransferFrom
    ET_Refund -- Calls --> USDC_Transfer
    ET_Withdraw -- Calls --> USDC_Transfer
```

## 7. Conclusion

- A brief summary of the document's contents and its utility for developers.
