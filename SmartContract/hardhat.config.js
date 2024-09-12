require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    tBNB: {
      url: `https://bsc-testnet-rpc.publicnode.com`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: 97,
    },
  },
};
