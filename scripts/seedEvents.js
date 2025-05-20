// scripts/seedEvents.js
const hre = require("hardhat");
const ethers = hre.ethers; // Alias for convenience

// ---------------------------------------------------------------------------------
// TODO: !! IMPORTANT !!
// Replace this with the actual address of your deployed EventTicketFactory contract
const EVENT_TICKET_FACTORY_ADDRESS =
  "0xC2df92f22325074e77631B8B721ffbB2670f26ef"; // User's provided address
// ---------------------------------------------------------------------------------

const eventTicketFactoryABI = [
  "function createEvent(string memory _name, string memory _symbol, string memory _eventName, uint256 _date, uint256 _totalTickets, uint256 _ticketPrice, uint256 _ticketLimit) public returns (address)",
  "event EventCreated(address indexed eventContract, string name, string symbol, string eventName, uint256 date, uint256 totalTickets, uint256 ticketPrice, uint256 ticketLimit)",
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
    totalTickets: 1000n, // Use BigInt literal for uint256
    ticketPrice: ethers.parseEther("0.01"), // Use ethers.parseEther
    ticketLimit: 5n, // Use BigInt literal for uint256
  };

  const now = Math.floor(Date.now() / 1000);
  const oneWeekInSeconds = 7 * 24 * 60 * 60;
  const twoWeeksFromNow = now + 2 * oneWeekInSeconds; // This will be a JS number

  const eventsToCreate = [
    {
      name: "Sublime Ticket",
      symbol: "SUBLT",
      eventName: "Sublime - Long Beach Reunion Tour",
      date: BigInt(twoWeeksFromNow), // Convert to BigInt for uint256 argument
      description: "American ska punk band from Long Beach, California...",
    },
    {
      name: "Led Zeppelin Ticket",
      symbol: "LEDZT",
      eventName: "Led Zeppelin - Celebration Night",
      date: BigInt(twoWeeksFromNow + oneWeekInSeconds), // Convert to BigInt
      description: "English rock band formed in London in 1968...",
    },
    {
      name: "Jimi Hendrix Exp Ticket",
      symbol: "JHEXP",
      eventName: "The Jimi Hendrix Experience - Electric Church",
      date: BigInt(twoWeeksFromNow + 2 * oneWeekInSeconds), // Convert to BigInt
      description: "American guitarist, songwriter and singer...",
    },
  ];

  for (const eventData of eventsToCreate) {
    console.log(`\nCreating event: ${eventData.eventName}`);
    console.log(`  Token Name: ${eventData.name}, Symbol: ${eventData.symbol}`);
    // eventData.date is now a BigInt, .toString() is fine. For new Date(), convert to Number.
    console.log(
      `  Date (Timestamp): ${eventData.date.toString()} (${new Date(
        Number(eventData.date) * 1000
      ).toLocaleString()})`
    );
    console.log(`  Total Tickets: ${commonSettings.totalTickets.toString()}`);
    // commonSettings.ticketPrice is a BigInt (Wei)
    console.log(
      `  Ticket Price (Wei): ${commonSettings.ticketPrice.toString()} (${ethers.formatEther(
        commonSettings.ticketPrice
      )} ETH)`
    ); // Use ethers.formatEther
    console.log(`  Ticket Limit: ${commonSettings.ticketLimit.toString()}`); // <--- CORRECTED
    // ...

    try {
      const tx = await eventTicketFactory.createEvent(
        eventData.name,
        eventData.symbol,
        eventData.eventName,
        eventData.date, // Pass BigInt directly
        commonSettings.totalTickets, // Pass BigInt directly
        commonSettings.ticketPrice, // Pass BigInt directly
        commonSettings.ticketLimit // Pass BigInt directly
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
        const { eventContract, name, date } = foundEventArgs;
        console.log(`  SUCCESS: Event "${name}" created!`);
        console.log(`  New EventTicket contract deployed at: ${eventContract}`);
        // 'date' from event args will likely be a BigInt
        console.log(
          `  Event Date (from event): ${new Date(
            Number(date) * 1000
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
