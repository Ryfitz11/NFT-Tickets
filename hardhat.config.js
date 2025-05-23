// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox"); // or require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { BASE_SEPOLIA_RPC_URL, PRIVATE_KEY, BASESCAN_API_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust runs for optimization level
      },
    },
  },
  networks: {
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532, // Chain ID for Base Sepolia
    },
    // You can add other networks here (e.g., localhost for testing)
    hardhat: {
      // Configuration for the local Hardhat Network
    },
  },
  etherscan: {
    // For contract verification on Basescan
    apiKey: {
      baseSepolia: BASESCAN_API_KEY || "",
    },
    // If you need to specify custom chains for verification (Hardhat might do this automatically for Base Sepolia now)
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api", // Basescan API URL for Base Sepolia
          browserURL: "https://sepolia.basescan.org", // Basescan Browser URL for Base Sepolia
        },
      },
    ],
  },
  sourcify: {
    // Optional: for Sourcify verification
    enabled: true,
  },
};
