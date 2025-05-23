const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicket Workflow (via Factory with USDC and IPFS)", function () {
    let EventTicketFactory, eventTicketFactory;
    let EventTicket; // Contract factory for attaching to deployed EventTicket instances
    let deployedEventTicket; // Attached instance of a deployed EventTicket
    let MockUSDC, mockUSDC;
    let owner, buyer1, buyer2; // Signers

    // Consistent test data
    const erc721Name = "Awesome Event Tickets";
    const erc721Symbol = "AET";
    const eventName = "The Grand Concert";
    let eventDateTimestamp; // Will be set to a future date in beforeEach
    const totalTickets = 100;
    const usdcDecimals = 6; // Align with MockUSDC
    const ticketPriceInUSDC = ethers.parseUnits("25", usdcDecimals); // 25 USDC
    const ticketLimitPerBuyer = 3;
    const sampleEventImageIPFSPath = "ipfs://QmXgZAUCHEAPqZcw2d2XUyA2aoPB2SjCghLVRHJZ3C3x1Z";
    const sampleBaseMetadataURI = "ipfs://QmYBaseURIForMetadataFolder/";

    beforeEach(async function () {
        [owner, buyer1, buyer2] = await ethers.getSigners();

        eventDateTimestamp = Math.floor(Date.now() / 1000) + (3600 * 24 * 7); // 7 days from now

        // 1. Deploy MockUSDC
        MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDC.deploy("Mock USDC", "mUSDC");
        await mockUSDC.waitForDeployment();
        const mockUSDCAddress = await mockUSDC.getAddress();

        // Mint some mUSDC to buyer1 and buyer2 for testing
        await mockUSDC.mint(buyer1.address, ethers.parseUnits("1000", usdcDecimals));
        await mockUSDC.mint(buyer2.address, ethers.parseUnits("50", usdcDecimals));

        // 2. Deploy EventTicketFactory
        EventTicketFactory = await ethers.getContractFactory("EventTicketFactory");
        eventTicketFactory = await EventTicketFactory.deploy();
        await eventTicketFactory.waitForDeployment();

        // 3. Deploy an EventTicket instance using the factory
        const createTx = await eventTicketFactory.connect(owner).createEvent(
            erc721Name,
            erc721Symbol,
            eventName,
            eventDateTimestamp,
            totalTickets,
            ticketPriceInUSDC,
            ticketLimitPerBuyer,
            mockUSDCAddress,          // New: USDC token address
            sampleEventImageIPFSPath  // New: IPFS image path
        );
        const receipt = await createTx.wait();

        // 4. Get the deployed EventTicket address from the factory event
        // (Ensure your factory emits an event like `EventTicketCreated(address contractAddress, ...)` )
        let deployedEventTicketAddress;
        if (receipt.logs) { // Standard for Hardhat/Ethers v6+
            // Correct event signature from EventTicketFactory.sol
            const eventSignature = "EventCreated(address,address,string,string,uint256,uint256,uint256,address,string)";
            const eventTopic = ethers.id(eventSignature);
            const eventLog = receipt.logs.find(log => log.topics[0] === eventTopic && log.address === await eventTicketFactory.getAddress());
            if (eventLog) {
                 const decodedEvent = eventTicketFactory.interface.parseLog(eventLog);
                 deployedEventTicketAddress = decodedEvent.args.eventContractAddress; // Corrected argument name
            }
        }
        // Fallback if event parsing is tricky or factory returns address directly
        // If your factory's `createEventTicket` returns the address:
        // deployedEventTicketAddress = await eventTicketFactory.connect(owner).callStatic.createEvent(...); // for view
        // Or if you have a getter in factory: deployedEventTicketAddress = await eventTicketFactory.getLatestTicketContract();

        if (!deployedEventTicketAddress) {
            // A robust way: listen for the event from the factory directly after the tx
            const filter = eventTicketFactory.filters.EventTicketCreated(null, owner.address); // Assuming owner is indexed
            const events = await eventTicketFactory.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
            if (events.length > 0) {
                 // Find the specific event for this transaction if multiple creations happen in same block for same owner
                const specificEvent = events.find(e => e.transactionHash === receipt.hash);
                if (specificEvent) {
                    deployedEventTicketAddress = specificEvent.args.eventContractAddress; // Corrected argument name
                } else {
                    throw new Error("EventCreated event not found for this transaction hash");
                }
            } else {
                throw new Error("EventTicketCreated event not found or owner mismatch in filter");
            }
        }

        // 5. Attach to the deployed EventTicket contract
        EventTicket = await ethers.getContractFactory("EventTicket");
        deployedEventTicket = EventTicket.attach(deployedEventTicketAddress);
    });

    describe("Deployment and Configuration", function () {
        it("Should have correct owner", async function () {
            expect(await deployedEventTicket.owner()).to.equal(owner.address);
        });

        it("Should have correct USDC token address, ticket price, and image path", async function () {
            expect(await deployedEventTicket.usdcToken()).to.equal(await mockUSDC.getAddress());
            expect(await deployedEventTicket.ticketPrice()).to.equal(ticketPriceInUSDC);
            expect(await deployedEventTicket.getEventImageIPFSPath()).to.equal(sampleEventImageIPFSPath);
        });

        it("Owner can set base URI for metadata", async function () {
            await deployedEventTicket.connect(owner).setBaseURI(sampleBaseMetadataURI);
            // To check, you'd ideally mint a token and call tokenURI
            // For example, if buyer1 buys ticket 0:
            await mockUSDC.connect(buyer1).approve(await deployedEventTicket.getAddress(), ticketPriceInUSDC);
            await deployedEventTicket.connect(buyer1).buyTicket();
            expect(await deployedEventTicket.tokenURI(0)).to.equal(sampleBaseMetadataURI + "0");
        });
    });

    describe("Ticket Purchase with USDC", function () {
        beforeEach(async function () {
            // Buyer1 approves the EventTicket contract to spend their mUSDC
            await mockUSDC.connect(buyer1).approve(await deployedEventTicket.getAddress(), ticketPriceInUSDC * BigInt(ticketLimitPerBuyer));
        });

        it("Should allow a user to buy a ticket with USDC", async function () {
            const buyer1InitialUSDC = await mockUSDC.balanceOf(buyer1.address);
            const contractInitialUSDC = await mockUSDC.balanceOf(await deployedEventTicket.getAddress());

            await expect(deployedEventTicket.connect(buyer1).buyTicket())
                .to.emit(deployedEventTicket, "Transfer") // ERC721 Transfer from zero address
                .withArgs(ethers.ZeroAddress, buyer1.address, 0); // Minting ticketId 0

            expect(await deployedEventTicket.ownerOf(0)).to.equal(buyer1.address);
            const eventDetails = await deployedEventTicket.getEventDetails();
            expect(eventDetails.soldEventTickets).to.equal(1); // ticketsSold
            expect(await deployedEventTicket.ticketsBought(buyer1.address)).to.equal(1);

            // Verify USDC transfer
            expect(await mockUSDC.balanceOf(buyer1.address)).to.equal(buyer1InitialUSDC - ticketPriceInUSDC);
            expect(await mockUSDC.balanceOf(await deployedEventTicket.getAddress())).to.equal(contractInitialUSDC + ticketPriceInUSDC);
        });

        it("Should REJECT purchase if ETH is sent", async function () {
             await expect(deployedEventTicket.connect(buyer1).buyTicket({ value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("ETH not accepted; pay with USDC.");
        });

        it("Should fail if user has insufficient USDC allowance", async function () {
            // buyer2 has not approved enough or at all
            await expect(deployedEventTicket.connect(buyer2).buyTicket())
                .to.be.revertedWith("USDC allowance is insufficient. Please approve the contract to spend USDC.");
        });

        it("Should fail if user has insufficient USDC balance (even if approved)", async function () {
            const poorBuyerSigner = (await ethers.getSigners())[3]; // Assuming a fresh signer
            await mockUSDC.mint(poorBuyerSigner.address, ticketPriceInUSDC - BigInt(1)); // Mint less than price
            await mockUSDC.connect(poorBuyerSigner).approve(await deployedEventTicket.getAddress(), ticketPriceInUSDC);

            // The ERC20.transferFrom will fail.
            await expect(deployedEventTicket.connect(poorBuyerSigner).buyTicket())
                .to.be.revertedWith("ERC20: transfer amount exceeds balance"); // Error from MockUSDC
        });

        it