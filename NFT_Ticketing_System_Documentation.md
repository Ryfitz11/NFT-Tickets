# NFT Ticketing System: Smart Contract & Frontend Integration Guide

## 1. Introduction

This document provides a comprehensive overview of the NFT Ticketing System, built with Solidity smart contracts. It details the functionalities of `EventTicketFactory.sol` and `EventTicket.sol`, and offers a guide for developers looking to build a frontend application to interact with these contracts. The system uses `MockUSDC.sol` for testing USDC transactions.

## 2. Smart Contract Overview

The system comprises two main smart contracts:

- **`EventTicketFactory.sol`**: This contract serves as a decentralized factory for creating and deploying individual event contracts.
- **`EventTicket.sol`**: Each instance of this contract represents a unique event, managing its tickets as ERC721 NFTs.

### 2.1. `EventTicketFactory.sol`

- **Role**: The primary role of [`EventTicketFactory.sol`](contracts/EventTicketFactory.sol) is to act as a deployer for new [`EventTicket.sol`](contracts/EventTicket.sol) contract instances. This allows for a standardized way to launch new events on the blockchain.
- **Mechanism**: Event organizers interact with the [`createEvent()`](contracts/EventTicketFactory.sol:24) function within this factory contract. This function takes various parameters defining the event and its tickets, and then deploys a new, separate [`EventTicket.sol`](contracts/EventTicket.sol) contract tailored to that specific event.
- **Tracking**: The factory maintains an array called [`eventContracts`](contracts/EventTicketFactory.sol:8), which stores the blockchain addresses of all [`EventTicket.sol`](contracts/EventTicket.sol) contracts it has deployed. This allows for easy discovery of all events created through the factory.
- **Notification**: Upon the successful deployment of a new event contract, the factory emits an [`EventCreated`](contracts/EventTicketFactory.sol:11) event. This event includes key details about the newly created event contract, such as its address, the creator's address, and essential event parameters. This is useful for off-chain services or frontends to listen for new events.

### 2.2. `EventTicket.sol`

- **Role**: Each deployed instance of [`EventTicket.sol`](contracts/EventTicket.sol) is an ERC721 compliant NFT contract. In this system, each NFT (token) minted by this contract represents a unique, non-fungible ticket to a specific event.
- **Core Functionalities**:
  - **Event Details Management**: Stores and manages crucial information about the event, such as its name, date, total number of tickets available, number of tickets sold, and whether the event has been canceled. This is managed within the [`Event`](contracts/EventTicket.sol:8) struct and the [`eventDetails`](contracts/EventTicket.sol:15) state variable.
  - **Ticket Sales**: Handles the sale of tickets. Users can call the [`buyTicket()`](contracts/EventTicket.sol:106) function to purchase a ticket, which involves a USDC payment.
  - **Event Cancellation**: The owner of the event contract (typically the event creator) can cancel the event using the [`cancelEvent()`](contracts/EventTicket.sol:145) function.
  - **Refunds**: If an event is canceled, users who originally purchased tickets can claim a refund in USDC via the [`claimRefund()`](contracts/EventTicket.sol:161) function.
  - **Fund Withdrawal**: After the event has occurred (and if it wasn't canceled), the event creator can withdraw the USDC funds collected from ticket sales using the [`withdrawFunds()`](contracts/EventTicket.sol:223) function.
  - **Ticket Transfers**: As ERC721 tokens, tickets can be freely transferred between user accounts using standard ERC721 transfer functions or the provided [`transferTicket()`](contracts/EventTicket.sol:200) helper function.
  - **Ticket Usage Marking**: Event organizers (contract owners) can mark a ticket as "used" (e.g., when a ticket holder enters the event) using the [`markTicketAsUsed()`](contracts/EventTicket.sol:244) function.
  - **Metadata Management**: Supports ERC721 metadata. The contract owner can set a base URI using [`setBaseURI()`](contracts/EventTicket.sol:88), which is then used to construct the `tokenURI` for each ticket NFT, pointing to off-chain JSON metadata that describes the ticket (name, description, image).

## 3. Key Contract Functions

### 3.1. `EventTicketFactory.sol`

#### `createEvent()`

- **Signature**: `createEvent(string memory _erc721Name, string memory _erc721Symbol, string memory _eventName, uint256 _date, uint256 _totalTickets, uint256 _ticketPriceInUSDC, uint256 _ticketLimit, address _usdcTokenAddress, string memory _eventImageIPFSPath)`
- **Usage**: Called by an event organizer to launch a new ticketed event. This function deploys a new instance of the [`EventTicket.sol`](contracts/EventTicket.sol) contract.
- **Parameters**:
  - `_erc721Name` (string): The name for the NFT collection representing tickets for this event (e.g., "My Awesome Concert Tickets").
  - `_erc721Symbol` (string): The symbol for the NFT collection (e.g., "MACT").
  - `_eventName` (string): The specific, human-readable name of the event (e.g., "Summer Music Festival 2025").
  - `_date` (uint256): The Unix timestamp representing the date and time of the event. Must be in the future.
  - `_totalTickets` (uint256): The total number of tickets that will be available for this event. Must be greater than 0.
  - `_ticketPriceInUSDC` (uint256): The price of a single ticket in the smallest atomic unit of the USDC token (e.g., if USDC has 6 decimals, $10 USDC would be `10 * 10^6 = 10000000`).
  - `_ticketLimit` (uint256): The maximum number of tickets a single address is allowed to purchase for this event. Must be greater than 0 and not exceed `_totalTickets`.
  - `_usdcTokenAddress` (address): The contract address of the USDC token to be used for payments.
  - `_eventImageIPFSPath` (string): An IPFS path (e.g., "ipfs://Qm...") pointing to an image representing the event. This path is stored in the `EventTicket` contract and can be used in the NFT metadata.
- **Actions**:
  1.  Performs several `require` checks to validate the input parameters (e.g., names not empty, date in future, positive ticket numbers).
  2.  Deploys a new [`EventTicket.sol`](contracts/EventTicket.sol) contract instance, passing the provided parameters (and `msg.sender` as the initial owner) to its constructor.
  3.  Stores the address of the newly deployed [`EventTicket.sol`](contracts/EventTicket.sol) contract in the [`eventContracts`](contracts/EventTicketFactory.sol:8) array.
  4.  Emits an [`EventCreated`](contracts/EventTicketFactory.sol:11) event containing details of the new event contract and its parameters.

#### `getAllEventAddresses()`

- **Signature**: `getAllEventAddresses() public view returns (address[] memory)`
- **Purpose**: This view function returns an array containing the blockchain addresses of all [`EventTicket.sol`](contracts/EventTicket.sol) contracts that have been deployed by this factory.
- **Usage**: Frontends will typically call this function to discover all available events. They can then iterate through these addresses to instantiate each [`EventTicket.sol`](contracts/EventTicket.sol) contract and fetch its specific details.

### 3.2. `EventTicket.sol`

#### Constructor

- **Signature**: `constructor(string memory _erc721Name, string memory _erc721Symbol, string memory _eventName, uint256 _date, uint256 _totalTickets, uint256 _ticketPriceInUSDC, uint256 _ticketLimit, address _usdcTokenAddress, string memory _eventImageIPFSPath, address initialOwner)`
- **Parameters & Initialization**: This function is called only once when the [`EventTicket.sol`](contracts/EventTicket.sol) contract is deployed (typically by the `EventTicketFactory`).
  - It initializes the ERC721 token with the given `_erc721Name` and `_erc721Symbol`.
  - It sets the `initialOwner` (passed from the factory, usually the event creator) as the owner of this specific event contract using `Ownable(initialOwner)`.
  - It populates the [`eventDetails`](contracts/EventTicket.sol:15) struct with `_eventName`, `_date`, `_totalTickets`, and sets `ticketsSold` to 0 and `isCanceled` to `false`.
  - It stores the `_ticketPriceInUSDC` in the immutable `ticketPrice` state variable.
  - It sets the `ticketLimit` (max tickets per buyer).
  - It creates an interface to the USDC token contract using `usdcToken = IERC20(_usdcTokenAddress)`.
  - It stores the `_eventImageIPFSPath`.
  - It performs `require` checks on the input parameters similar to the factory.

#### `buyTicket()`

- **Signature**: `buyTicket() public payable`
- **Process**: This function allows a user to purchase one or more tickets (up to their `ticketLimit`).
  1.  **Pre-conditions**:
      - Checks that the event is not canceled ([`eventDetails.isCanceled`](contracts/EventTicket.sol:107)).
      - Checks that the event date has not passed ([`block.timestamp < eventDetails.date`](contracts/EventTicket.sol:111)).
      - Checks that tickets are still available ([`eventDetails.ticketsSold < eventDetails.totalTickets`](contracts/EventTicket.sol:115)).
      - Ensures no Ether is sent with the transaction, as payment is in USDC ([`msg.value == 0`](contracts/EventTicket.sol:119)).
      - Checks that the buyer has not reached their individual purchase limit ([`ticketsBought[msg.sender] < ticketLimit`](contracts/EventTicket.sol:123)).
  2.  **USDC Payment**:
      - The buyer ( `msg.sender`) must have previously approved the `EventTicket` contract ( `address(this)`) to spend at least `ticketPrice` of their USDC tokens. This is done by calling the `approve()` function on the USDC contract.
      - The function checks the current allowance: `usdcToken.allowance(msg.sender, address(this))`.
      - If the allowance is sufficient, it attempts to transfer `ticketPrice` USDC from the buyer to the `EventTicket` contract using `usdcToken.transferFrom(msg.sender, address(this), ticketPrice)`.
  3.  **Ticket Minting**:
      - If the USDC transfer is successful, a new NFT ticket is minted to the buyer (`_mint(msg.sender, ticketId)`). `ticketId` is managed by `nextTicketId`.
      - `nextTicketId` is incremented.
      - `eventDetails.ticketsSold` is incremented.
      - `ticketsBought[msg.sender]` (tracking initial purchases by this address) is incremented.

#### `cancelEvent()`

- **Signature**: `cancelEvent() public onlyOwner`
- **Purpose**: Allows the contract owner (event creator) to cancel the event.
- **Implications**:
  - Sets [`eventDetails.isCanceled`](contracts/EventTicket.sol:151) to `true`.
  - Emits an [`EventCanceled`](contracts/EventTicket.sol:31) event with the timestamp of cancellation.
  - Once canceled, functions like [`buyTicket()`](contracts/EventTicket.sol:106) and [`transferTicket()`](contracts/EventTicket.sol:200) will typically be blocked.
  - This action enables users to claim refunds via [`claimRefund()`](contracts/EventTicket.sol:161).
- **Conditions**: Can only be called if the event is not already canceled and the event date has not passed.

#### `claimRefund()`

- **Signature**: `claimRefund() public`
- **Process**: Allows a user to claim a refund in USDC if the event has been canceled.
  1.  **Conditions**:
      - Checks that the event is indeed canceled ([`eventDetails.isCanceled`](contracts/EventTicket.sol:167)).
      - Checks that the `msg.sender` has not already claimed their refund ([`!hasRefunded[msg.sender]`](contracts/EventTicket.sol:171)).
      - Checks that the `msg.sender` originally bought tickets ([`ticketsBought[msg.sender] > 0`](contracts/EventTicket.sol:175)).
  2.  **Refund Calculation**: The refund amount is `ticketPrice * ticketsBought[msg.sender]`. This means the _original buyer_ gets the refund, even if they transferred the ticket(s) later.
  3.  **USDC Transfer**:
      - Marks the user as having refunded: `hasRefunded[msg.sender] = true`.
      - Checks if the contract has sufficient USDC balance for the refund.
      - Transfers the calculated `refundAmount` of USDC from the contract back to the `msg.sender` using `usdcToken.transfer(msg.sender, refundAmount)`.
  4.  **Event Emission**: Emits a [`RefundClaimed`](contracts/EventTicket.sol:32) event with the user's address and the refund amount.

#### `withdrawFunds()`

- **Signature**: `withdrawFunds() public onlyOwner`
- **Purpose**: Allows the contract owner (event creator) to withdraw the USDC funds collected from ticket sales.
- **Conditions**:
  - The event must not be canceled (as funds might be needed for refunds).
  - The event date must have passed (`block.timestamp > eventDetails.date`).
  - The contract must have a USDC balance greater than zero.
- **Action**: Transfers the entire USDC balance of the contract to the `owner()` of the contract.

#### `transferTicket()`

- **Signature**: `transferTicket(uint256 ticketId, address to) public`
- **Purpose**: Allows the current owner of a specific ticket (NFT) to transfer it to another address (`to`). This is a helper function that wraps the standard ERC721 `_transfer` functionality with additional checks.
- **Conditions**:
  - The event must not be canceled.
  - The `msg.sender` must be the current owner of the `ticketId` (`ownerOf(ticketId) == msg.sender`).
  - The ticket must not have been marked as used (`!isUsed[ticketId]`).
- **Action**: Calls the internal `_transfer(msg.sender, to, ticketId)` function from the ERC721 standard, which changes ownership and emits a `Transfer` event.
- **Note**: This function does not update the `ticketsBought` mapping, which is used for refund logic based on initial purchase.

#### `markTicketAsUsed()`

- **Signature**: `markTicketAsUsed(uint256 ticketId) public onlyOwner`
- **Purpose**: Allows the contract owner (typically the event organizer at the venue) to mark a specific ticket as "used."
- **Conditions**:
  - The event must not be canceled.
  - The `ticketId` must exist (i.e., have been minted).
  - The ticket must have a valid owner.
  - The ticket must not already be marked as used (`!isUsed[ticketId]`).
- **Action**: Sets `isUsed[ticketId] = true`. Emits a [`TicketMarkedAsUsed`](contracts/EventTicket.sol:30) event with the `ticketId` and the address of the user who owned the ticket when it was marked.

#### `setBaseURI()`

- **Signature**: `setBaseURI(string memory baseURI_) public onlyOwner`
- **Purpose**: Allows the contract owner to set the base URI for the ERC721 token metadata.
- **Usage**: The `baseURI_` should point to a directory or path where metadata JSON files for each token ID are stored (e.g., `"ipfs://<CID_for_metadata_folder>/"`). The full `tokenURI` for a ticket is then constructed by concatenating this `_baseTokenURI` with the `tokenId` (and often a `.json` suffix, depending on the setup).
- **Metadata JSON Example**: For a ticket with `tokenId` 1, the metadata at `baseURI_ + "1.json"` might look like:
  ```json
  {
    "name": "Ticket #1",
    "description": "Ticket for [Event Name]",
    "image": "[IPFS Path from getEventImageIPFSPath()]"
  }
  ```

#### `setTicketLimit()`

- **Signature**: `setTicketLimit(uint256 newLimit) public onlyOwner`
- **Purpose**: Allows the contract owner to change the maximum number of tickets a single address can purchase after the event contract has been deployed.
- **Conditions**:
  - Event must not be canceled.
  - `newLimit` must be greater than 0.
  - `newLimit` cannot exceed `eventDetails.totalTickets`.

#### Getter Functions

The [`EventTicket.sol`](contracts/EventTicket.sol) contract includes several public view functions to retrieve data:

- [`getEventDetails()`](contracts/EventTicket.sol:211): Returns `eventName`, `eventDate`, `totalEventTickets`, `soldEventTickets`, and `isEventCanceled`.
- [`getTicketStatus(uint256 ticketId)`](contracts/EventTicket.sol:252): Returns `true` if the ticket `isUsed`, `false` otherwise.
- [`getEventImageIPFSPath()`](contracts/EventTicket.sol:97): Returns the `eventImageIPFSPath` string.
- [`isTicketOwner(address user, uint256 ticketId)`](contracts/EventTicket.sol:257): Checks if a given `user` is the owner of `ticketId`.
- [`getUserTickets(address user)`](contracts/EventTicket.sol:263): Returns an array of `ticketId`s owned by the specified `user`.
- [`getRefundStatus(address user)`](contracts/EventTicket.sol:279): Returns `true` if the `user` has claimed a refund, `false` otherwise.
- **Public State Variables**: Many state variables are public, making their values directly readable (e.g., `ticketPrice`, `ticketLimit`, `eventDetails` (individual fields need to be accessed if it's a struct returned directly), `usdcToken` (returns address), `nextTicketId`).

## 4. Frontend Integration Guide

This section outlines how a frontend application (e.g., a React DApp) can interact with the NFT ticketing smart contracts. Libraries like Ethers.js or Web3.js are commonly used.

### 4.1. Setup

1.  **Connect to Ethereum Provider**:

    - The frontend needs to connect to the user's Ethereum wallet (e.g., MetaMask) to read blockchain data and send transactions.
    - This is typically done by checking for `window.ethereum`.
    - Example (Ethers.js):

      ```javascript
      import { ethers } from "ethers";

      async function connectWallet() {
        if (window.ethereum) {
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Request account access
            const signer = provider.getSigner();
            return { provider, signer };
          } catch (error) {
            console.error(
              "User rejected account access or error connecting:",
              error
            );
            // Handle error appropriately
          }
        } else {
          console.error("MetaMask (or other Ethereum provider) not detected.");
          // Prompt user to install MetaMask
        }
        return null;
      }
      ```

2.  **Load Contract ABIs and Addresses**:

    - **ABIs (Application Binary Interfaces)**: These are JSON files that describe the contract's functions and events. They are generated during contract compilation (e.g., by Hardhat or Truffle) and are needed by Ethers.js/Web3.js to interact with the contracts.
      - You'll need the ABIs for `EventTicketFactory.sol`, `EventTicket.sol`, and `MockUSDC.sol` (or the standard ERC20 ABI for a live USDC).
    - **Contract Addresses**:

      - **`EventTicketFactory` Address**: This address is known after you deploy `EventTicketFactory.sol` to a network. It should be stored in your frontend's configuration.
      - **`EventTicket` Addresses**: These are dynamic. You'll fetch them using `EventTicketFactory.getAllEventAddresses()`.
      - **USDC Token Address**: The address of the `MockUSDC` contract (if testing) or the official USDC contract address on the target network.

    - Example (Ethers.js - creating contract instances):

      ```javascript
      // Assuming you have:
      // factoryABI, eventTicketABI, usdcABI
      // factoryAddress, usdcAddress
      // provider, signer from connectWallet()

      const factoryContract = new ethers.Contract(
        factoryAddress,
        factoryABI,
        signer || provider
      );
      // For a specific event ticket contract:
      // const eventTicketContract = new ethers.Contract(eventTicketAddress, eventTicketABI, signer || provider);
      const usdcContract = new ethers.Contract(
        usdcAddress,
        usdcABI,
        signer || provider
      );
      ```

### 4.2. Event Creation (for Event Organizers)

1.  **Instantiate `EventTicketFactory`**: Use its ABI and address.
2.  **Call `createEvent()`**:
    - The frontend will have a form where the organizer inputs all necessary parameters for the `createEvent` function.
    - Ensure data types are correct (e.g., numbers for `uint256`, strings for `string`). Prices and timestamps need careful handling.
    - Example (Ethers.js):
      ```javascript
      async function createNewEvent(params) {
        // params = { _erc721Name, _erc721Symbol, ..., _eventImageIPFSPath }
        try {
          const tx = await factoryContract.createEvent(
            params._erc721Name,
            params._erc721Symbol,
            params._eventName,
            ethers.BigNumber.from(params._date), // Ensure date is a BigNumber if it's a large number string
            ethers.BigNumber.from(params._totalTickets),
            ethers.BigNumber.from(params._ticketPriceInUSDC), // e.g., 10 * 10**6 for $10 USDC (6 decimals)
            ethers.BigNumber.from(params._ticketLimit),
            params._usdcTokenAddress,
            params._eventImageIPFSPath
          );
          await tx.wait(); // Wait for transaction confirmation
          console.log("Event created successfully! Tx hash:", tx.hash);
          // Listen to EventCreated event or re-fetch events to update UI
        } catch (error) {
          console.error("Error creating event:", error);
          // Handle transaction errors (user rejection, out of gas, contract revert)
        }
      }
      ```

### 4.3. Displaying Events

1.  **Get All Event Addresses**:
    - Call `factoryContract.getAllEventAddresses()`.
    ```javascript
    async function fetchAllEventAddresses() {
      try {
        const addresses = await factoryContract.getAllEventAddresses();
        return addresses;
      } catch (error) {
        console.error("Error fetching event addresses:", error);
        return [];
      }
    }
    ```
2.  **Fetch Details for Each Event**:
    - Iterate through the returned addresses. For each address:
      - Create an `EventTicket` contract instance using the `eventTicketABI` and the specific event's address.
      - Call getter functions like `getEventDetails()`, `ticketPrice()`, `eventImageIPFSPath()`, etc., to fetch information.
    - Example (Ethers.js - fetching details for one event):
      ```javascript
      async function getEventInfo(eventAddress) {
        const eventContract = new ethers.Contract(
          eventAddress,
          eventTicketABI,
          provider
        ); // Use provider for read-only
        try {
          const details = await eventContract.getEventDetails();
          const price = await eventContract.ticketPrice();
          const imagePath = await eventContract.getEventImageIPFSPath();
          // ... and other details
          return {
            address: eventAddress,
            name: details.eventName,
            date: new Date(details.eventDate.toNumber() * 1000), // Convert Unix timestamp
            totalTickets: details.totalEventTickets.toNumber(),
            soldTickets: details.soldEventTickets.toNumber(),
            isCanceled: details.isEventCanceled,
            price: price.toString(), // Keep as string or format appropriately
            imagePath: imagePath,
          };
        } catch (error) {
          console.error(
            `Error fetching details for event ${eventAddress}:`,
            error
          );
          return null;
        }
      }
      ```
    - Display this information in the UI (e.g., as event cards).

### 4.4. Buying Tickets

This is a two-step process for the user:

1.  **Step 1: Approve USDC Spending**:

    - The user must approve the _specific `EventTicket` contract_ (the one for the event they want to buy a ticket for) to spend their USDC.
    - Instantiate the USDC contract (`MockUSDC` or real USDC) with a `signer`.
    - Call the `approve()` function on the USDC contract.
    - `spenderAddress` is the address of the `EventTicket` contract.
    - `amountToApprove` should be at least `ticketPrice` (or `ticketPrice * numberOfTickets` if buying multiple, though this contract mints one per call).
    - Example (Ethers.js):
      ```javascript
      async function approveUSDC(
        eventTicketContractAddress,
        usdcAmountToApprove
      ) {
        // usdcContract should be instantiated with a signer
        try {
          const tx = await usdcContract.approve(
            eventTicketContractAddress,
            usdcAmountToApprove
          );
          await tx.wait();
          console.log("USDC approval successful! Tx hash:", tx.hash);
          return true;
        } catch (error) {
          console.error("Error approving USDC:", error);
          // Handle errors
          return false;
        }
      }
      // Before calling buyTicket, ensure allowance is checked or approval is made:
      // const allowance = await usdcContract.allowance(userAddress, eventTicketContractAddress);
      // if (allowance.lt(ticketPrice)) { /* prompt for approval */ }
      ```

2.  **Step 2: Call `buyTicket()`**:
    - Instantiate the specific `EventTicket` contract with a `signer`.
    - Call its `buyTicket()` function.
    - Example (Ethers.js):
      ```javascript
      async function purchaseTicket(eventTicketContractAddress) {
        const eventContract = new ethers.Contract(
          eventTicketContractAddress,
          eventTicketABI,
          signer
        );
        try {
          // The contract expects ticketPrice to be handled internally from its state.
          // No msg.value is sent as it's a USDC transaction.
          const tx = await eventContract.buyTicket();
          await tx.wait();
          console.log("Ticket purchased successfully! Tx hash:", tx.hash);
          // Update UI, perhaps by re-fetching event details or user's tickets
        } catch (error) {
          console.error("Error purchasing ticket:", error);
          // Handle errors like "USDC allowance insufficient", "All tickets sold", etc.
        }
      }
      ```

### 4.5. Event Management (for Event Creators/Owners)

The owner of an `EventTicket` contract can call its management functions. The frontend needs to ensure `msg.sender` is the owner.

- **`setBaseURI(baseURI_)`**:
  ```javascript
  // eventContract instantiated with owner's signer
  // const tx = await eventContract.setBaseURI("ipfs://YOUR_METADATA_CID/");
  // await tx.wait();
  ```
- **`setTicketLimit(newLimit)`**:
  ```javascript
  // const tx = await eventContract.setTicketLimit(ethers.BigNumber.from(newLimit));
  // await tx.wait();
  ```
- **`cancelEvent()`**:
  ```javascript
  // const tx = await eventContract.cancelEvent();
  // await tx.wait();
  ```
- **`withdrawFunds()`**:
  ```javascript
  // const tx = await eventContract.withdrawFunds();
  // await tx.wait();
  ```
- **`markTicketAsUsed(ticketId)`**:
  ```javascript
  // const tx = await eventContract.markTicketAsUsed(ethers.BigNumber.from(ticketId));
  // await tx.wait();
  ```
  Each of these calls should be wrapped in `try...catch` blocks for error handling and provide feedback to the user on transaction status.

### 4.6. User Ticket Management

- **Displaying Owned Tickets**:
  - Get the user's address (`signer.getAddress()`).
  - For each `EventTicket` contract the user might have tickets for (or iterate all known events):
    - Call `eventContract.balanceOf(userAddress)` to see how many tickets they own for that event.
    - Call `eventContract.getUserTickets(userAddress)` to get an array of `ticketId`s.
    - For each `ticketId`:
      - Call `eventContract.tokenURI(ticketId)` to get the metadata URI (if `_baseTokenURI` is set). Fetch and display metadata (name, image, description).
      - Call `eventContract.getTicketStatus(ticketId)` to see if it's used.
- **`claimRefund()`**:
  - If an event is canceled (check `eventContract.getEventDetails().isEventCanceled`), users can claim refunds.
  - The user calls `eventContract.claimRefund()`.
  ```javascript
  // eventContract instantiated with user's signer
  // const tx = await eventContract.claimRefund();
  // await tx.wait();
  ```
- **`transferTicket(ticketId, toAddress)`**:
  - The user (owner of the ticket) calls `eventContract.transferTicket(ticketId, toAddress)`.
  ```javascript
  // eventContract instantiated with user's signer
  // const tx = await eventContract.transferTicket(ethers.BigNumber.from(ticketId), recipientAddress);
  // await tx.wait();
  ```

### 4.7. Listening to Contract Events

Smart contract events allow the frontend to react to state changes without constant polling.

- **Ethers.js Example**:

  ```javascript
  // For EventTicketFactory
  factoryContract.on(
    "EventCreated",
    (
      eventContractAddress,
      creator,
      erc721Name,
      eventName,
      /* ...other params */ event
    ) => {
      console.log("New Event Created:");
      console.log("  Contract Address:", eventContractAddress);
      console.log("  Creator:", creator);
      console.log("  Event Name:", eventName);
      // Update UI: add new event to the list, show notification
      // 'event' is the full event object with transaction details
    }
  );

  // For a specific EventTicket contract instance (eventContract)
  eventContract.on("TicketMarkedAsUsed", (ticketId, user, event) => {
    console.log(
      `Ticket ${ticketId.toString()} for user ${user} marked as used.`
    );
    // Update UI for that specific ticket
  });

  eventContract.on("EventCanceled", (timestamp, event) => {
    console.log(
      `Event at ${eventContract.address} canceled at ${new Date(
        timestamp.toNumber() * 1000
      )}`
    );
    // Update UI: show event as canceled, enable refund button
  });

  eventContract.on("RefundClaimed", (user, amountInUSDC, event) => {
    console.log(
      `User ${user} claimed refund of ${ethers.utils.formatUnits(
        amountInUSDC,
        6
      )} USDC.`
    ); // Assuming 6 decimals for USDC
    // Update UI for that user
  });
  ```

- Remember to handle event listener cleanup, especially in component-based frameworks like React (e.g., in `useEffect` cleanup).

### 4.8. Error Handling

- **Common Errors**:
  - **User Rejection**: User cancels transaction in MetaMask.
  - **Insufficient Funds**: For gas (ETH) or for USDC payment.
  - **Contract `require` Failures**: The smart contract's `require` statements can fail (e.g., "All tickets sold", "USDC allowance is insufficient", "Event has been canceled"). The error message from the contract is usually included in the error object.
  - **Network Issues**: Problems connecting to the Ethereum node.
  - **Transaction Reverted**: Generic transaction failure.
  - **Gas Estimation Failed**: Often indicates an issue that will cause a revert.
- **Presentation**:
  - Parse error messages to provide user-friendly feedback. Ethers.js often includes a `reason` field in the error for contract reverts.
  - Use loading states for pending transactions.
  - Provide clear success and failure notifications.
  - Offer guidance on how to resolve common issues (e.g., "Ensure you have enough ETH for gas fees," or "Please approve USDC spending first.").

## 5. Important Considerations

- **Gas Fees**:
  - All transactions that modify the blockchain state (e.g., `createEvent`, `buyTicket`, `transferTicket`, `setBaseURI`) require gas, which is paid in the native currency of the network (e.g., ETH on Ethereum mainnet).
  - View functions (marked `view` or `pure` in Solidity, like `getEventDetails`, `getAllEventAddresses`) do not consume gas when called off-chain (e.g., from a frontend reading data).
  - Gas fees can fluctuate based on network congestion. Frontends should display estimated gas fees provided by wallets.
- **Transaction Confirmation Times**:
  - Blockchain transactions are not instant. They need to be mined and confirmed by the network. This can take from a few seconds to several minutes or more, depending on the network and gas price paid.
  - Frontends must handle these pending states:
    - Show a loading indicator after a transaction is submitted.
    - Inform the user that the transaction is processing.
    - Update the UI once the transaction is confirmed (e.g., 1 block confirmation for quick feedback, more for higher security).
    - Handle transaction failures/reverts.
- **Security Best Practices for Frontend**:
  - **Never Handle Private Keys**: The frontend should never ask for or store user private keys. All transaction signing must be delegated to the user's wallet (e.g., MetaMask).
  - **Validate User Inputs**: Sanitize and validate all inputs on the frontend before sending them to the smart contract to prevent unexpected behavior or errors, though the contract should be the ultimate source of truth for validation.
  - **Clear Communication**: Clearly explain to the user what action they are about to perform and what transaction they are signing (e.g., "You are about to purchase 1 ticket for Event X for 10 USDC.").
  - **Protect Against Phishing**: Educate users about connecting their wallets only to trusted sites.
  - **RPC Endpoints**: Use reliable and secure RPC endpoints to connect to the Ethereum network.
  - **Display Data Verifiably**: When displaying critical data from the blockchain, ensure it's directly fetched or verified, rather than relying on an intermediary backend if possible for sensitive operations.
- **Role of `MockUSDC.sol`**:
  - [`MockUSDC.sol`](contracts/MockUSDC.sol) is a simplified ERC20 token provided for **development and testing purposes only**.
  - **Advantages for Testing**:
    - Allows developers to easily `mint` tokens to test accounts without needing real USDC.
    - Can simulate transfer failures using `setTransferToFail(true)` for testing error handling.
    - Can be deployed with custom decimals (e.g., 6 to mimic real USDC).
  - **vs. Live USDC Token**:
    - **Real Value**: A live USDC token is backed by real US dollars and has actual monetary value. `MockUSDC` has no real-world value.
    - **Official Contract Addresses**: Live USDC has official, audited contract addresses on different networks (e.g., Ethereum Mainnet, Polygon). `MockUSDC` is deployed by you to your test network.
    - **Standard Decimals**: Live USDC typically has 6 decimals.
    - **Permissions**: You cannot mint live USDC tokens; they are managed by Circle.
  - **Deployment**: When moving to a live environment (mainnet or a public testnet like Sepolia), you must replace the `MockUSDC` address with the official USDC contract address for that network and ensure your application interacts with the real token.

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
            FC_Create([createEvent(...)])
            FC_GetAll([getAllEventAddresses()])
            FC_Storage[(eventContracts Array)]
            FC_Event{[EventCreated Event]}

            FC_Create --> FC_Storage
            FC_Create -- emits --> FC_Event
            FC_GetAll --> FC_Storage
        end

        subgraph EventContractTemplate [EventTicket (Deployed Instance)]
            direction TB
            ET_Constructor([constructor(...)])
            ET_Buy([buyTicket()])
            ET_Cancel([cancelEvent()])
            ET_Refund([claimRefund()])
            ET_Withdraw([withdrawFunds()])
            ET_Transfer([transferTicket()])
            ET_MarkUsed([markTicketAsUsed()])
            ET_SetBaseURI([setBaseURI(...)])
            ET_SetLimit([setTicketLimit(...)])
            ET_Getters([View Functions e.g., getEventDetails()])
            ET_State[(Event State: details, ticketsSold, isCanceled, etc.)]
            ET_Events{[Contract Events: TicketMarkedAsUsed, EventCanceled, RefundClaimed]}

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
            USDC_Approve([approve(spender, amount)])
            USDC_TransferFrom([transferFrom(from, to, amount)])
            USDC_Transfer([transfer(to, amount)])
        end

        FC_Create -- Deploys --> EventContractTemplate
    end


    U -- Interacts --> App

    App -- Calls --> FC_Create
    App -- Calls --> FC_GetAll
    App -- Listens for Event --> FC_Event

    App -- Calls for User --> USDC_Approve

    App -- Calls for User --> ET_Buy
    App -- Calls for Owner --> ET_Cancel
    App -- Calls for User --> ET_Refund
    App -- Calls for Owner --> ET_Withdraw
    App -- Calls for User --> ET_Transfer
    App -- Calls for Owner --> ET_MarkUsed
    App -- Calls for Owner --> ET_SetBaseURI
    App -- Calls for Owner --> ET_SetLimit
    App -- Calls to Read --> ET_Getters
    App -- Listens for Events --> ET_Events


    ET_Buy -- Requires Approval & Calls --> USDC_TransferFrom
    ET_Refund -- Calls --> USDC_Transfer
    ET_Withdraw -- Calls --> USDC_Transfer
```

## 7. Conclusion

This document has provided a detailed walkthrough of the `EventTicketFactory` and `EventTicket` smart contracts, along with a guide for frontend integration. By understanding the roles of these contracts, their key functions, and the considerations for frontend development, developers can build robust and user-friendly decentralized applications for NFT-based event ticketing. Remember to prioritize security, user experience, and clear communication when interacting with smart contracts.
