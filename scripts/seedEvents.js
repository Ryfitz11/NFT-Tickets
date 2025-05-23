// scripts/seedEvents.js
const hre = require("hardhat");
const ethers = hre.ethers; // Alias for convenience

// ---------------------------------------------------------------------------------
// TODO: !! IMPORTANT !!
// Replace this with the actual address of your deployed EventTicketFactory contract
const EVENT_TICKET_FACTORY_ADDRESS =
  "0x5b77166e711cAB78763eB322d099216BC846F423"; // User's provided address
// ---------------------------------------------------------------------------------

// Address for the USDC token on Base Sepolia
const USDC_TOKEN_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_DECIMALS = 6; // Standard for USDC

const eventTicketFactoryABI = [
  "function createEvent(string memory _erc721Name, string memory _erc721Symbol, string memory _eventName, uint256 _date, uint256 _totalTickets, uint256 _ticketPriceInUSDC, uint256 _ticketLimit, address _usdcTokenAddress, string memory _eventImageIPFSPath) public",
  "event EventCreated(address indexed eventContractAddress, address indexed creator, string erc721Name, string eventName, uint256 date, uint256 totalTickets, uint256 ticketPriceInUSDC, address usdcTokenAddress, string eventImageIPFSPath)",
];

async function main() {
  if (
    EVENT_TICKET_FACTORY_ADDRESS ===
      "YOUR_DEPLOYED_EVENT_TICKET_FACTORY_ADDRESS" ||
    EVENT_TICKET_FACTORY_ADDRESS === ""
  ) {
    console.error(
      "Please replace 'YOUR_DEPLOYED_EVENT_TICKET_FACTORY_ADDRESS' with the actual contract address in scripts/seedEvents.js"
    );
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Using account to seed events:", deployer.address);
  // Balance is already a BigInt, toString() is fine
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  const eventTicketFactory = new ethers.Contract(
    EVENT_TICKET_FACTORY_ADDRESS,
    eventTicketFactoryABI,
    deployer
  );

  console.log(
    `\nInteracting with EventTicketFactory at: ${EVENT_TICKET_FACTORY_ADDRESS}`
  );

  // --- Define Event Data (ethers.js v6 adjustments) ---
  const commonSettings = {
    totalTickets: 1000n,
    ticketPriceInUSDC: ethers.parseUnits("10", USDC_DECIMALS), // e.g., 10 USDC
    ticketLimit: 5n,
    // Placeholder IPFS path - replace with actual CIDs for real events
    defaultEventImageIPFSPath: "ipfs://QmPlaceholderImageHash12345",
  };

  const now = Math.floor(Date.now() / 1000);
  const oneWeekInSeconds = 7 * 24 * 60 * 60;
  const twoWeeksFromNow = now + 2 * oneWeekInSeconds; // This will be a JS number

  const eventsToCreate = [
    {
      name: "Sublime Ticket",
      symbol: "SUBLT",
      eventName: "Sublime - Long Beach Reunion Tour",
      date: BigInt(twoWeeksFromNow),
      description: "American ska punk band from Long Beach, California...",
      eventImageIPFSPath:
        "ipfs://bafybeicudpmcnsps4b2lzhwflbgsd22jvmcg5ofubtnwwze54adnzzxmgq/sublime.jpg",
    },
    {
      name: "Led Zeppelin Ticket",
      symbol: "LEDZT",
      eventName: "Led Zeppelin - Celebration Night",
      date: BigInt(twoWeeksFromNow + oneWeekInSeconds),
      description: "English rock band formed in London in 1968...",
      eventImageIPFSPath:
        "ipfs://bafybeicudpmcnsps4b2lzhwflbgsd22jvmcg5ofubtnwwze54adnzzxmgq/led zeppelin.jpg",
    },
    {
      name: "Jimi Hendrix Exp Ticket",
      symbol: "JHEXP",
      eventName: "The Jimi Hendrix Experience - Electric Church",
      date: BigInt(twoWeeksFromNow + 2 * oneWeekInSeconds),
      description: "American guitarist, songwriter and singer...",
      eventImageIPFSPath:
        "ipfs://bafybeicudpmcnsps4b2lzhwflbgsd22jvmcg5ofubtnwwze54adnzzxmgq/Jimi+Hendrix+-+Are+You+Experienced+(1967)+front+back+album+cover+download-3640483497.jpg",
    },
  ];

  for (const eventData of eventsToCreate) {
    console.log(`\nCreating event: ${eventData.eventName}`);
    console.log(`  Token Name: ${eventData.name}, Symbol: ${eventData.symbol}`);
    console.log(
      `  Date (Timestamp): ${eventData.date.toString()} (${new Date(
        Number(eventData.date) * 1000
      ).toLocaleString()})`
    );
    console.log(`  Total Tickets: ${commonSettings.totalTickets.toString()}`);
    console.log(
      `  Ticket Price: ${ethers.formatUnits(
        commonSettings.ticketPriceInUSDC,
        USDC_DECIMALS
      )} USDC (${commonSettings.ticketPriceInUSDC.toString()} atomic units)`
    );
    console.log(`  Ticket Limit: ${commonSettings.ticketLimit.toString()}`);
    console.log(`  USDC Token Address: ${USDC_TOKEN_ADDRESS}`);
    console.log(
      `  Event Image IPFS Path: ${
        eventData.eventImageIPFSPath || commonSettings.defaultEventImageIPFSPath
      }`
    );

    try {
      const tx = await eventTicketFactory.createEvent(
        eventData.name,
        eventData.symbol,
        eventData.eventName,
        eventData.date,
        commonSettings.totalTickets,
        commonSettings.ticketPriceInUSDC,
        commonSettings.ticketLimit,
        USDC_TOKEN_ADDRESS,
        eventData.eventImageIPFSPath || commonSettings.defaultEventImageIPFSPath
      );

      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`  Transaction confirmed in block: ${receipt.blockNumber}`);

      const eventCreatedLog = receipt.logs?.find((log) => {
        // With ethers v6, logs are parsed differently if you don't use the contract instance to parse them.
        // However, if the `eventTicketFactory` instance is used for the call, `receipt.events` (or `receipt.logs` parsed) should work.
        // A more robust way to get parsed logs from a specific contract:
        const anInterface = eventTicketFactory.interface;
        try {
          const parsedLog = anInterface.parseLog(log);
          return parsedLog?.name === "EventCreated";
        } catch (e) {
          // Not a log from this contract's ABI
          return false;
        }
      });

      // A simpler way in ethers v6 if you expect specific events from the transaction:
      // `receipt.events` is deprecated in v6 for `tx.wait()`. You need to parse `receipt.logs`.
      // Or, a common pattern is to filter logs by the contract address and topic for the event.
      // However, Hardhat might still populate `receipt.events` through its wrappers for convenience.
      // Let's try to get the event directly from the receipt if Hardhat's wrapper provides it,
      // otherwise parse from logs.

      let foundEventArgs = null;
      if (receipt.events) {
        // Hardhat often provides this for convenience
        const specificEvent = receipt.events.find(
          (e) => e.event === "EventCreated"
        );
        if (specificEvent) foundEventArgs = specificEvent.args;
      }

      // If not found via Hardhat's 'events' array, parse from raw logs
      if (!foundEventArgs) {
        for (const log of receipt.logs) {
          if (
            log.address.toLowerCase() ===
            EVENT_TICKET_FACTORY_ADDRESS.toLowerCase()
          ) {
            try {
              const parsedLog = eventTicketFactory.interface.parseLog(log);
              if (parsedLog && parsedLog.name === "EventCreated") {
                foundEventArgs = parsedLog.args;
                break;
              }
            } catch (e) {
              // This log doesn't match an event in the contract's ABI
            }
          }
        }
      }

      if (foundEventArgs) {
        const {
          eventContractAddress,
          creator,
          erc721Name,
          eventName: emittedEventName,
          date: emittedDate,
          // ... other event args if needed
        } = foundEventArgs;
        console.log(`  SUCCESS: Event "${erc721Name}" created!`);
        console.log(
          `  New EventTicket contract deployed at: ${eventContractAddress}`
        );
        console.log(`  Creator: ${creator}`);
        console.log(
          `  Event Date (from event): ${new Date(
            Number(emittedDate) * 1000
          ).toLocaleString()}`
        );
      } else {
        console.warn(
          "  EventCreated event not found in transaction receipt. Check ABI, event name, or parsing logic."
        );
      }
    } catch (error) {
      console.error(
        `  Failed to create event "${eventData.eventName}":`,
        error
      );
    }
  }

  console.log("\nFinished seeding events.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
