const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EventTicketFactory Contract Tests", function () {
  let EventTicketFactory, eventTicketFactory;
  let MockUSDC, mockUSDC;
  let owner, creator, anotherAccount;
  let mockUSDCAddress;

  // Consistent test data
  const validERC721Name = "Test Event Tickets";
  const validERC721Symbol = "TET";
  const validEventName = "Factory Test Concert";
  let validEventDateTimestamp;
  const validTotalTickets = 100;
  const usdcDecimals = 6;
  const validTicketPriceInUSDC = ethers.parseUnits("10", usdcDecimals); // 10 USDC
  const validTicketLimitPerBuyer = 5;
  const validEventImageIPFSPath = "ipfs://QmValidFactoryImage";
  const validBaseMetadataURI = "ipfs://QmValidFactoryBaseURI/";

  beforeEach(async function () {
    [owner, creator, anotherAccount] = await ethers.getSigners();

    // Deploy MockUSDC
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy("Mock USDC", "mUSDC");
    await mockUSDC.waitForDeployment();
    mockUSDCAddress = await mockUSDC.getAddress();

    // Deploy EventTicketFactory
    EventTicketFactory = await ethers.getContractFactory("EventTicketFactory");
    eventTicketFactory = await EventTicketFactory.deploy({
      from: owner.address,
    });
    await eventTicketFactory.waitForDeployment();

    // Set a valid future date for events
    validEventDateTimestamp = (await time.latest()) + 3600 * 24 * 7; // 7 days from now
  });

  describe("Deployment", function () {
    it("Should set the right owner for the factory (if Ownable)", async function () {
      // EventTicketFactory itself is not Ownable in the provided code,
      // but if it were, this is how you'd test it.
      // For now, we just confirm it deployed.
      expect(await eventTicketFactory.getAddress()).to.not.equal(
        ethers.ZeroAddress
      );
    });
  });

  describe("createEvent Function", function () {
    it("Should successfully create an event with valid parameters", async function () {
      const tx = await eventTicketFactory
        .connect(creator)
        .createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        );
      const receipt = await tx.wait();

      // Check for the EventCreated event
      const eventSignature =
        "EventCreated(address,address,string,string,uint256,uint256,uint256,address,string)";
      const eventTopic = ethers.id(eventSignature);

      let eventFound = false;
      let createdEventAddress;

      for (const log of receipt.logs) {
        if (log.topics[0] === eventTopic) {
          const decodedEvent = eventTicketFactory.interface.parseLog(log);
          expect(decodedEvent.args.creator).to.equal(creator.address);
          expect(decodedEvent.args.erc721Name).to.equal(validERC721Name);
          expect(decodedEvent.args.eventName).to.equal(validEventName);
          expect(decodedEvent.args.date).to.equal(validEventDateTimestamp);
          expect(decodedEvent.args.totalTickets).to.equal(validTotalTickets);
          expect(decodedEvent.args.ticketPriceInUSDC).to.equal(
            validTicketPriceInUSDC
          );
          expect(decodedEvent.args.usdcTokenAddress).to.equal(mockUSDCAddress);
          expect(decodedEvent.args.eventImageIPFSPath).to.equal(
            validEventImageIPFSPath
          );
          createdEventAddress = decodedEvent.args.eventContractAddress;
          eventFound = true;
          break;
        }
      }
      expect(eventFound, "EventCreated event not emitted or not found").to.be
        .true;

      // Check that the event is stored in the factory
      const allEvents = await eventTicketFactory.getAllEvents();
      expect(allEvents.length).to.equal(1);
      expect(allEvents[0]).to.equal(createdEventAddress); // In new Hardhat, array stores addresses

      const allEventAddresses = await eventTicketFactory.getAllEventAddresses();
      expect(allEventAddresses.length).to.equal(1);
      expect(allEventAddresses[0]).to.equal(createdEventAddress);

      // Further check the deployed EventTicket contract's properties
      const EventTicket = await ethers.getContractFactory("EventTicket");
      const deployedEventTicket = EventTicket.attach(createdEventAddress);
      expect(await deployedEventTicket.owner()).to.equal(creator.address); // Owner of EventTicket is creator
      expect(await deployedEventTicket.name()).to.equal(validERC721Name);
      expect(await deployedEventTicket.symbol()).to.equal(validERC721Symbol);
      const details = await deployedEventTicket.getEventDetails();
      expect(details.eventName).to.equal(validEventName);
    });

    // Test require statements in EventTicketFactory.createEvent
    it("Should REVERT if ERC721 name is empty", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          "", // Invalid
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("ERC721 name cannot be empty");
    });

    it("Should REVERT if ERC721 symbol is empty", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          "", // Invalid
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("ERC721 symbol cannot be empty");
    });

    it("Should REVERT if event name is empty", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          validERC721Symbol,
          "", // Invalid
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("Event name cannot be empty");
    });

    it("Should REVERT if event date is in the past", async function () {
      const pastDate = (await time.latest()) - 3600; // 1 hour ago
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          pastDate, // Invalid
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("Event date must be in the future");
    });

    it("Should REVERT if total tickets is 0", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          0, // Invalid
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("Total tickets must be greater than 0");
    });

    it("Should REVERT if ticket limit is 0", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          0, // Invalid
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("Ticket limit must be greater than 0");
    });

    it("Should REVERT if ticket limit exceeds total tickets", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTotalTickets + 1, // Invalid
          mockUSDCAddress,
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("Ticket limit cannot exceed total tickets");
    });

    it("Should REVERT if USDC token address is zero", async function () {
      await expect(
        eventTicketFactory.connect(creator).createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          ethers.ZeroAddress, // Invalid
          validEventImageIPFSPath
        )
      ).to.be.revertedWith("USDC token address cannot be zero");
    });

    // Note: The `require` statements within the EventTicket constructor are also implicitly tested here,
    // as the factory's `createEvent` will fail if those constructor requirements are not met
    // by the parameters passed from the factory. For example, if EventTicket's constructor
    // had a stricter check that the factory didn't, the `new EventTicket(...)` call would revert.
  });

  describe("Getter Functions", function () {
    it("getAllEvents and getAllEventAddresses should return empty arrays initially", async function () {
      expect(await eventTicketFactory.getAllEvents()).to.deep.equal([]);
      expect(await eventTicketFactory.getAllEventAddresses()).to.deep.equal([]);
    });

    it("getAllEvents and getAllEventAddresses should return correct data after multiple event creations", async function () {
      const tx1 = await eventTicketFactory
        .connect(creator)
        .createEvent(
          "Event One",
          "E1",
          "Concert One",
          validEventDateTimestamp,
          100,
          validTicketPriceInUSDC,
          5,
          mockUSDCAddress,
          "ipfs1"
        );
      const receipt1 = await tx1.wait();
      let eventAddr1;
      for (const log of receipt1.logs) {
        if (
          log.topics[0] ===
          ethers.id(
            "EventCreated(address,address,string,string,uint256,uint256,uint256,address,string)"
          )
        ) {
          eventAddr1 =
            eventTicketFactory.interface.parseLog(log).args
              .eventContractAddress;
          break;
        }
      }

      const futureDate2 = validEventDateTimestamp + 3600;
      const tx2 = await eventTicketFactory
        .connect(anotherAccount)
        .createEvent(
          "Event Two",
          "E2",
          "Concert Two",
          futureDate2,
          200,
          validTicketPriceInUSDC,
          10,
          mockUSDCAddress,
          "ipfs2"
        );
      const receipt2 = await tx2.wait();
      let eventAddr2;
      for (const log of receipt2.logs) {
        if (
          log.topics[0] ===
          ethers.id(
            "EventCreated(address,address,string,string,uint256,uint256,uint256,address,string)"
          )
        ) {
          eventAddr2 =
            eventTicketFactory.interface.parseLog(log).args
              .eventContractAddress;
          break;
        }
      }

      const allEvents = await eventTicketFactory.getAllEvents();
      expect(allEvents.length).to.equal(2);
      // In new Hardhat, array stores addresses
      expect(allEvents).to.include.deep.members([eventAddr1, eventAddr2]);

      const allEventAddresses = await eventTicketFactory.getAllEventAddresses();
      expect(allEventAddresses.length).to.equal(2);
      expect(allEventAddresses).to.include.deep.members([
        eventAddr1,
        eventAddr2,
      ]);
    });
  });

  describe("EventTicket Contract Interactions (via Factory Deployed Instance)", function () {
    let deployedEventTicket;
    let eventContractAddress;

    beforeEach(async function () {
      // Deploy one event to interact with its EventTicket instance
      const tx = await eventTicketFactory
        .connect(creator)
        .createEvent(
          validERC721Name,
          validERC721Symbol,
          validEventName,
          validEventDateTimestamp,
          validTotalTickets,
          validTicketPriceInUSDC,
          validTicketLimitPerBuyer,
          mockUSDCAddress,
          validEventImageIPFSPath
        );
      const receipt = await tx.wait();
      for (const log of receipt.logs) {
        if (
          log.topics[0] ===
          ethers.id(
            "EventCreated(address,address,string,string,uint256,uint256,uint256,address,string)"
          )
        ) {
          eventContractAddress =
            eventTicketFactory.interface.parseLog(log).args
              .eventContractAddress;
          break;
        }
      }
      const EventTicket = await ethers.getContractFactory("EventTicket");
      deployedEventTicket = EventTicket.attach(eventContractAddress);
    });

    it("EventTicket: Owner (creator) should be able to set a valid base URI", async function () {
      await expect(
        deployedEventTicket.connect(creator).setBaseURI(validBaseMetadataURI)
      ).to.not.be.reverted;
      // To verify, we'd need to mint a token and check tokenURI, which is more of EventTicket's own test.
      // For now, just checking the call doesn't revert.
    });

    it("EventTicket: Should REVERT setBaseURI if called by non-owner", async function () {
      await expect(
        deployedEventTicket
          .connect(anotherAccount)
          .setBaseURI(validBaseMetadataURI)
      )
        .to.be.revertedWithCustomError(
          deployedEventTicket,
          "OwnableUnauthorizedAccount"
        )
        .withArgs(anotherAccount.address);
    });

    it("EventTicket: Should REVERT setBaseURI if URI is empty", async function () {
      await expect(
        deployedEventTicket.connect(creator).setBaseURI("")
      ).to.be.revertedWith("Base URI cannot be empty");
    });

    it("EventTicket: Owner (creator) should be able to set a valid ticket limit", async function () {
      const newLimit = validTicketLimitPerBuyer - 1;
      await expect(
        deployedEventTicket.connect(creator).setTicketLimit(newLimit)
      ).to.not.be.reverted;
      expect(await deployedEventTicket.ticketLimit()).to.equal(newLimit);
    });

    it("EventTicket: Should REVERT setTicketLimit if called by non-owner", async function () {
      await expect(
        deployedEventTicket
          .connect(anotherAccount)
          .setTicketLimit(validTicketLimitPerBuyer - 1)
      )
        .to.be.revertedWithCustomError(
          deployedEventTicket,
          "OwnableUnauthorizedAccount"
        )
        .withArgs(anotherAccount.address);
    });

    it("EventTicket: Should REVERT setTicketLimit if new limit is 0", async function () {
      await expect(
        deployedEventTicket.connect(creator).setTicketLimit(0)
      ).to.be.revertedWith("New ticket limit must be greater than 0");
    });

    it("EventTicket: Should REVERT setTicketLimit if new limit exceeds total tickets", async function () {
      await expect(
        deployedEventTicket
          .connect(creator)
          .setTicketLimit(validTotalTickets + 1)
      ).to.be.revertedWith("New ticket limit cannot exceed total tickets");
    });

    it("EventTicket: Should REVERT setTicketLimit if event is canceled", async function () {
      await deployedEventTicket.connect(creator).cancelEvent(); // Cancel the event
      await expect(
        deployedEventTicket
          .connect(creator)
          .setTicketLimit(validTicketLimitPerBuyer)
      ).to.be.revertedWith("Event has been canceled, cannot change limit");
    });
  });
});
