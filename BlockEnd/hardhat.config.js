require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy");
// require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */

const BSC_RPC_URL = process.env.BSC_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATES_KEY = process.env.PRIVATES_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: "0.8.19",

  defaultNetwork: "hardhat",
  networks: {
    bsc: {
      url: BSC_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 97,
      // blockConfirmations: 6,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATES_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },

  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};
