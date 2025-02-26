// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

contract EventTicketFactory {
    // Array to store addresses of deployed EventTicket contracts
    EventTicket[] public events;

    // Event emitted when a new EventTicket contract is deployed
    event EventCreated(
        address eventContract,
        string name,
        string symbol,
        string eventName,
        uint256 date,
        uint256 totalTickets,
        uint256 ticketPrice,
        uint256 ticketLimit
    );

    // Function to deploy a new EventTicket contract
    function createEvent(
        string memory _name,
        string memory _symbol,
        string memory _eventName,
        uint256 _date,
        uint256 _totalTickets,
        uint256 _ticketPrice,
        uint256 _ticketLimit // Replace with an appropriate value if needed
    ) public {
        // Placeholder for seventh argument (assuming uint256)

        EventTicket newEvent = new EventTicket(
            _name,
            _symbol,
            _eventName,
            _date,
            _totalTickets,
            _ticketPrice,
            _ticketLimit // Placeholder seventh argument
        );

        // Transfer ownership of the new contract to the user who called this function
        newEvent.transferOwnership(msg.sender);

        // Store the deployed contract in the events array
        events.push(newEvent);

        // Emit an event for off-chain tracking
        emit EventCreated(
            address(newEvent),
            _name,
            _symbol,
            _eventName,
            _date,
            _totalTickets,
            _ticketPrice,
            _ticketLimit
        );
    }

    // Function to get all deployed EventTicket contract addresses
    function getAllEvents() public view returns (EventTicket[] memory) {
        return events;
    }
}
