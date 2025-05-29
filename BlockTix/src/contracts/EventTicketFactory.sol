// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol"; // Make sure this path is correct

contract EventTicketFactory {
    // Array to store addresses of deployed EventTicket contracts
    // Storing only addresses of deployed EventTicket contracts
    address[] public eventContracts;

    // Event emitted when a new EventTicket contract is deployed
    event EventCreated(
        address indexed eventContractAddress,
        address indexed creator,
        string erc721Name,
        string eventName,
        uint256 date,
        uint256 totalTickets,
        uint256 ticketPriceInUSDC, // price is in USDC
        address usdcTokenAddress,
        string eventImageIPFSPath
    );

    // Function to deploy a new EventTicket contract
    function createEvent(
        string memory _erc721Name, // Name for the NFT (e.g., "My Concert Tickets")
        string memory _erc721Symbol, // Symbol for the NFT (e.g., "MCT")
        string memory _eventName, // Specific name of the event (e.g., "Summer Fest 2025")
        uint256 _date, // Unix timestamp of the event
        uint256 _totalTickets, // Total number of tickets available
        uint256 _ticketPriceInUSDC, // Price per ticket in USDC (atomic units)
        uint256 _ticketLimit, // Max tickets a single address can buy
        address _usdcTokenAddress, // Address of the USDC token contract
        string memory _eventImageIPFSPath // IPFS path for the event's image (e.g., "ipfs://Qm...")
    ) public {
        require(bytes(_erc721Name).length > 0, "ERC721 name cannot be empty");
        require(
            bytes(_erc721Symbol).length > 0,
            "ERC721 symbol cannot be empty"
        );
        require(bytes(_eventName).length > 0, "Event name cannot be empty");
        require(_date > block.timestamp, "Event date must be in the future");
        require(_totalTickets > 0, "Total tickets must be greater than 0");
        require(_ticketLimit > 0, "Ticket limit must be greater than 0");
        require(
            _ticketLimit <= _totalTickets,
            "Ticket limit cannot exceed total tickets"
        );
        require(
            _usdcTokenAddress != address(0),
            "USDC token address cannot be zero"
        );

        EventTicket newEventTicket = new EventTicket(
            _erc721Name,
            _erc721Symbol,
            _eventName,
            _date,
            _totalTickets,
            _ticketPriceInUSDC,
            _ticketLimit,
            _usdcTokenAddress, // Pass the USDC token address
            _eventImageIPFSPath, // Pass the IPFS image path
            msg.sender // Pass the creator as the initial owner
        );

        // Store the address of the deployed contract in the eventContracts array
        eventContracts.push(address(newEventTicket));

        // Emit an event for off-chain tracking
        emit EventCreated(
            address(newEventTicket),
            msg.sender,
            _erc721Name,
            _eventName,
            _date,
            _totalTickets,
            _ticketPriceInUSDC,
            _usdcTokenAddress, // Include in event
            _eventImageIPFSPath // Include in event
        );
    }

    // Function to get deployed EventTicket contract addresses (more gas-efficient for just addresses)

    function getAllEventAddresses() public view returns (address[] memory) {
        address[] memory addresses = new address[](eventContracts.length);
        for (uint i = 0; i < eventContracts.length; i++) {
            addresses[i] = eventContracts[i]; // eventContracts already stores addresses
        }
        return addresses;
    }
}
