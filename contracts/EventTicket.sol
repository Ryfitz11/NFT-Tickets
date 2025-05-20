// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket is ERC721, Ownable {
    struct Event {
        string name;
        uint256 date;
        uint256 totalTickets;
        uint256 ticketsSold;
        bool isCanceled;
    }

    Event public eventDetails;
    mapping(uint256 => address) public ticketOwners;
    mapping(address => uint256) public ticketsBought;
    mapping(uint256 => bool) public isUsed;
    mapping(address => bool) public hasRefunded;

    uint256 public nextTicketId;
    uint256 public immutable ticketPrice;
    uint256 public ticketLimit;

    event TicketMarkedAsUsed(uint256 indexed ticketId, address indexed user);
    event EventCanceled(uint256 timestamp);
    event RefundClaimed(address indexed user, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _eventName,
        uint256 _date,
        uint256 _totalTickets,
        uint256 _ticketPrice,
        uint256 _ticketLimit
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        eventDetails = Event({
            name: _eventName,
            date: _date,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            isCanceled: false
        });
        ticketPrice = _ticketPrice;
        ticketLimit = _ticketLimit;
    }

    function buyTicket() public payable {
        require(!eventDetails.isCanceled, "Event has been canceled");
        require(
            block.timestamp < eventDetails.date,
            "Event has already occurred"
        );
        require(
            eventDetails.ticketsSold < eventDetails.totalTickets,
            "All tickets sold"
        );
        require(msg.value >= ticketPrice, "Insufficient payment");
        require(
            ticketsBought[msg.sender] < ticketLimit,
            "Ticket purchase limit reached"
        );

        uint256 ticketId = nextTicketId;
        ticketOwners[ticketId] = msg.sender;
        _mint(msg.sender, ticketId);
        nextTicketId++;
        eventDetails.ticketsSold++;
        ticketsBought[msg.sender]++;
    }

    function cancelEvent() public onlyOwner {
        require(!eventDetails.isCanceled, "Event is already canceled");
        require(
            block.timestamp < eventDetails.date,
            "Event has already occurred"
        );

        eventDetails.isCanceled = true;
        emit EventCanceled(block.timestamp);
    }

    function claimRefund() public {
        require(eventDetails.isCanceled, "Event is not canceled");
        require(!hasRefunded[msg.sender], "Already claimed refund");
        require(ticketsBought[msg.sender] > 0, "No tickets to refund");

        uint256 refundAmount = ticketPrice * ticketsBought[msg.sender];
        hasRefunded[msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(msg.sender, refundAmount);
    }

    function setTicketLimit(uint256 newLimit) public onlyOwner {
        require(!eventDetails.isCanceled, "Event has been canceled");
        ticketLimit = newLimit;
    }

    function transferTicket(uint256 ticketId, address to) public {
        require(!eventDetails.isCanceled, "Event has been canceled");
        require(ownerOf(ticketId) == msg.sender, "You do not own this ticket");
        require(!isUsed[ticketId], "Ticket has already been used");
        _transfer(msg.sender, to, ticketId);
        ticketOwners[ticketId] = to;
    }

    function getEventDetails()
        public
        view
        returns (string memory, uint256, uint256, uint256, bool)
    {
        return (
            eventDetails.name,
            eventDetails.date,
            eventDetails.totalTickets,
            eventDetails.ticketsSold,
            eventDetails.isCanceled
        );
    }

    function withdrawFunds() public onlyOwner {
        require(
            !eventDetails.isCanceled,
            "Cannot withdraw from canceled event"
        );
        require(
            block.timestamp > eventDetails.date,
            "Cannot withdraw before event"
        );

        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Assumes token IDs are sequential and never burned.
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < nextTicketId;
    }

    function markTicketAsUsed(uint256 ticketId) public onlyOwner {
        require(!eventDetails.isCanceled, "Event has been canceled");
        require(_exists(ticketId), "Ticket does not exist");
        require(!isUsed[ticketId], "Ticket has already been used");
        isUsed[ticketId] = true;
        emit TicketMarkedAsUsed(ticketId, ownerOf(ticketId));
    }

    function getTicketStatus(uint256 ticketId) public view returns (bool) {
        require(_exists(ticketId), "Ticket does not exist");
        return isUsed[ticketId];
    }

    function isTicketOwner(
        address user,
        uint256 ticketId
    ) public view returns (bool) {
        return ownerOf(ticketId) == user;
    }

    function getUserTickets(
        address user
    ) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tickets = new uint256[](balance);
        uint256 index = 0;

        for (uint256 i = 0; i < nextTicketId; i++) {
            if (ownerOf(i) == user) {
                tickets[index] = i;
                index++;
            }
        }

        return tickets;
    }

    function getRefundStatus(address user) public view returns (bool) {
        return hasRefunded[user];
    }
}
