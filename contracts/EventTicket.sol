// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // For USDC interaction
import "@openzeppelin/contracts/utils/Strings.sol"; // For ERC721 metadata URI construction

contract EventTicket is ERC721, Ownable {
    struct Event {
        string name;
        uint256 date;
        uint256 totalTickets;
        uint256 ticketsSold;
        bool isCanceled;
    }

    Event public eventDetails;

    mapping(address => uint256) public ticketsBought; // Tracks initial number of tickets bought by an address
    mapping(uint256 => bool) public isUsed;
    mapping(address => bool) public hasRefunded;

    uint256 public nextTicketId;
    uint256 public immutable ticketPrice; // Price in USDC (atomic units)
    uint256 public ticketLimit;

    IERC20 public usdcToken; // Interface for the USDC token contract
    string public eventImageIPFSPath; // IPFS path for the event's image (e.g., "ipfs://QmHashForImage")
    string private _baseTokenURI; // Base URI for token metadata JSON files

    event TicketMarkedAsUsed(uint256 indexed ticketId, address indexed user);
    event EventCanceled(uint256 timestamp);
    event RefundClaimed(address indexed user, uint256 amountInUSDC);

    constructor(
        string memory _erc721Name, // Name for the NFT collection (e.g., "EventX Tickets")
        string memory _erc721Symbol, // Symbol for the NFT collection (e.g., "EXT")
        string memory _eventName, // Detailed name of the event
        uint256 _date, // Event date (Unix timestamp)
        uint256 _totalTickets,
        uint256 _ticketPriceInUSDC, // Price in USDC (e.g., for $10 USDC with 6 decimals, pass 10000000)
        uint256 _ticketLimit, // Max tickets per buyer
        address _usdcTokenAddress, // Address of the USDC contract
        string memory _eventImageIPFSPath // IPFS path to the event's image
    ) ERC721(_erc721Name, _erc721Symbol) Ownable(msg.sender) {
        require(bytes(_erc721Name).length > 0, "ERC721 name cannot be empty");
        require(
            bytes(_erc721Symbol).length > 0,
            "ERC721 symbol cannot be empty"
        );
        require(bytes(_eventName).length > 0, "Event name cannot be empty");
        require(_date > block.timestamp, "Event date must be in the future");
        require(_totalTickets > 0, "Total tickets must be greater than 0");
        // require(_ticketPriceInUSDC > 0, "Ticket price must be greater than 0"); // Optional: allow free events if price is 0
        require(_ticketLimit > 0, "Ticket limit must be greater than 0");
        require(
            _ticketLimit <= _totalTickets,
            "Ticket limit cannot exceed total tickets"
        );
        require(
            _usdcTokenAddress != address(0),
            "USDC token address cannot be zero"
        );

        eventDetails = Event({
            name: _eventName,
            date: _date,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            isCanceled: false
        });
        ticketPrice = _ticketPriceInUSDC;
        ticketLimit = _ticketLimit;
        usdcToken = IERC20(_usdcTokenAddress);
        eventImageIPFSPath = _eventImageIPFSPath;
    }

    // --- IPFS & Metadata ---

    /**
     * @dev Returns the base URI for resolving token URIs. Concatenated with `tokenId` to get the full URI.
     * Override from ERC721.sol.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Sets the base URI for token JSON metadata.
     * The URI should point to a directory/path where metadata files (e.g., 1.json, 2.json) are stored.
     * Example: "ipfs://<CID_for_metadata_folder>/" (notice the trailing slash).
     * The off-chain metadata JSON for each token should include:
     * {
     * "name": "Ticket #<tokenId>",
     * "description": "Ticket for <eventDetails.name>",
     * "image": "<this.getEventImageIPFSPath()>"
     * }
     * This function should be called by the owner after deploying the contract and uploading metadata.
     */
    function setBaseURI(string memory baseURI_) public onlyOwner {
        require(bytes(baseURI_).length > 0, "Base URI cannot be empty");
        _baseTokenURI = baseURI_;
    }

    /**
     * @dev Returns the IPFS path for the event's primary image.
     * This path is intended to be used in the off-chain generated metadata JSON.
     */
    function getEventImageIPFSPath() public view returns (string memory) {
        return eventImageIPFSPath;
    }

    // --- Ticket Operations ---

    function buyTicket() public payable {
        // `payable` is added to allow checking msg.value, even if we expect it to be 0 for USDC payments
        require(!eventDetails.isCanceled, "Event has been canceled");
        require(
            block.timestamp < eventDetails.date,
            "Event has already occurred"
        );
        require(
            eventDetails.ticketsSold < eventDetails.totalTickets,
            "All tickets sold"
        );
        require(msg.value == 0, "ETH not accepted; pay with USDC."); // Ensure no ETH is accidentally sent
        require(
            ticketsBought[msg.sender] < ticketLimit,
            "Ticket purchase limit reached"
        );

        // USDC Payment:
        // Buyer must have called `approve` on the USDC contract for this contract's address and for at least `ticketPrice`.
        uint256 currentAllowance = usdcToken.allowance(
            msg.sender,
            address(this)
        );
        require(
            currentAllowance >= ticketPrice,
            "USDC allowance is insufficient. Please approve the contract to spend USDC."
        );

        bool success = usdcToken.transferFrom(
            msg.sender,
            address(this),
            ticketPrice
        );
        require(
            success,
            "USDC transfer failed. Ensure you have enough USDC and have approved the contract."
        );

        uint256 ticketId = nextTicketId;

        _mint(msg.sender, ticketId); // Mints the NFT ticket
        nextTicketId++;
        eventDetails.ticketsSold++;
        ticketsBought[msg.sender]++;
    }

    function cancelEvent() public onlyOwner {
        require(!eventDetails.isCanceled, "Event is already canceled");
        require(
            block.timestamp < eventDetails.date,
            "Event has already occurred, cannot cancel"
        );
        eventDetails.isCanceled = true;
        emit EventCanceled(block.timestamp);
    }

    /**
     * @dev Allows a user to claim a refund in USDC if the event is canceled.
     * Refund is based on the number of tickets originally bought by the user (`ticketsBought`).
     * This means the original buyer gets the refund, even if tickets were transferred.
     * Consider implications if refunds should go to current owners.
     */
    function claimRefund() public {
        require(
            eventDetails.isCanceled,
            "Event is not canceled, cannot claim refund"
        );
        require(
            !hasRefunded[msg.sender],
            "You have already claimed your refund"
        );
        uint256 userTicketsToRefund = ticketsBought[msg.sender];
        require(
            userTicketsToRefund > 0,
            "You have no tickets to refund based on initial purchase"
        );

        uint256 refundAmount = ticketPrice * userTicketsToRefund;
        hasRefunded[msg.sender] = true;

        require(
            usdcToken.balanceOf(address(this)) >= refundAmount,
            "Contract has insufficient USDC balance for this refund."
        );
        bool success = usdcToken.transfer(msg.sender, refundAmount);
        require(success, "USDC refund transfer failed.");

        emit RefundClaimed(msg.sender, refundAmount);
    }

    function setTicketLimit(uint256 newLimit) public onlyOwner {
        require(
            !eventDetails.isCanceled,
            "Event has been canceled, cannot change limit"
        );
        require(newLimit > 0, "New ticket limit must be greater than 0");
        require(
            newLimit <= eventDetails.totalTickets,
            "New ticket limit cannot exceed total tickets"
        );
        ticketLimit = newLimit;
    }

    /**
     * @dev Transfers a ticket from the sender to a new owner.
     * Note: `ticketsBought` mapping is not updated here. It tracks initial purchases for refund logic.
     * If refunds should be claimable by new owners, `ticketsBought` would need adjustment upon transfer.
     */
    function transferTicket(uint256 ticketId, address to) public {
        require(
            !eventDetails.isCanceled,
            "Event has been canceled, transfers are disabled"
        );
        require(ownerOf(ticketId) == msg.sender, "You do not own this ticket");
        require(
            !isUsed[ticketId],
            "Ticket has already been used, cannot transfer"
        );

        // _transfer performs the ownership change and emits the Transfer event.
        _transfer(msg.sender, to, ticketId);
        // If you keep ticketOwners mapping: ticketOwners[ticketId] = to;
    }

    // --- View Functions ---

    function getEventDetails()
        public
        view
        returns (
            string memory eventName,
            uint256 eventDate,
            uint256 totalEventTickets,
            uint256 soldEventTickets,
            bool isEventCanceled
        )
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
            "Cannot withdraw funds from a canceled event; refunds might be pending."
        );
        require(
            block.timestamp > eventDetails.date,
            "Cannot withdraw funds before the event has occurred."
        );

        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        require(usdcBalance > 0, "No USDC funds to withdraw.");

        bool success = usdcToken.transfer(owner(), usdcBalance);
        require(success, "USDC withdrawal failed.");
    }

    /**
     * @dev Checks if a token ID has been minted. Relies on sequential minting without burning.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < nextTicketId;
    }

    function markTicketAsUsed(uint256 ticketId) public onlyOwner {
        require(!eventDetails.isCanceled, "Event has been canceled.");
        require(_exists(ticketId), "Ticket ID does not exist.");
        require(
            ownerOf(ticketId) != address(0),
            "Ticket does not have a valid owner."
        ); // Additional check
        require(!isUsed[ticketId], "Ticket has already been marked as used.");
        isUsed[ticketId] = true;
        emit TicketMarkedAsUsed(ticketId, ownerOf(ticketId));
    }

    function getTicketStatus(uint256 ticketId) public view returns (bool) {
        require(_exists(ticketId), "Ticket ID does not exist.");
        return isUsed[ticketId];
    }

    function isTicketOwner(
        address user,
        uint256 ticketId
    ) public view returns (bool) {
        require(_exists(ticketId), "Ticket ID does not exist.");
        return ownerOf(ticketId) == user;
    }

    function getUserTickets(
        address user
    ) public view returns (uint256[] memory) {
        uint256 userBalance = balanceOf(user);
        uint256[] memory tickets = new uint256[](userBalance);
        uint256 counter = 0;
        for (uint256 i = 0; i < nextTicketId; i++) {
            if (_exists(i) && ownerOf(i) == user) {
                tickets[counter] = i;
                counter++;
                if (counter == userBalance) break; // Optimization
            }
        }
        // If counter < userBalance due to some inconsistency (should not happen with correct _exists and balanceOf)
        // a resize might be needed, or ensure `balanceOf` is consistent with iteration.
        // For now, assuming consistency.
        return tickets;
    }

    function getRefundStatus(address user) public view returns (bool) {
        return hasRefunded[user];
    }
}
