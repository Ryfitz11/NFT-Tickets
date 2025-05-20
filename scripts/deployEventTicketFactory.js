const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying EventTicketFactory contract with the account:",
    deployer.address
  );
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // Get the ContractFactory for EventTicketFactory
  // Make sure your EventTicket.sol is in the contracts folder or the import path is correct.
  const EventTicketFactory = await hre.ethers.getContractFactory(
    "EventTicketFactory"
  );

  // Deploy the contract
  // The EventTicketFactory constructor does not take any arguments.
  const eventTicketFactory = await EventTicketFactory.deploy();

  // Wait for the contract to be deployed
  await eventTicketFactory.waitForDeployment();
  const contractAddress = await eventTicketFactory.getAddress();

  console.log("EventTicketFactory deployed to:", contractAddress);

  // Optional: Wait for a few confirmations if you want to verify immediately after.
  // This is especially useful on testnets where block times can vary.
  // if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
  //   console.log("Waiting for 5 block confirmations...");
  //   await eventTicketFactory.deploymentTransaction().wait(5);
  //   console.log("5 confirmations received.");
  // }

  // Optional: Verify the contract on Basescan
  // Make sure you have BASESCAN_API_KEY in your .env and etherscan config in hardhat.config.js
  if (hre.network.name === "baseSepolia" && process.env.BASESCAN_API_KEY) {
    console.log("Waiting a bit before attempting verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds for block explorer to index

    try {
      console.log("Verifying contract on Basescan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [], // No constructor arguments for EventTicketFactory
        // If your factory depends on other libraries that need to be linked, specify them here.
        // libraries: {
        //   SomeLibrary: "0x..."
        // }
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Verification failed:", error);
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified.");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
