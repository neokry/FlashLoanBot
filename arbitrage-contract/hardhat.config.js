require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

//account: 0x51ff89Fc9E42DE567b09554342C0032e675Dfa97
//contract: 0x8C8C8766D9f50a4fC8466aD1e512A9061dfab86d

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.6",
  networks: {
    mainnet: {
      url: process.env.ALCHEMY_LOCAL,
      accounts: {
        mnemonic: process.env.MNEMONIC_LOCAL,
      },
    },
    rinkeby: {
      url: process.env.ALCHEMY_RINKEBY,
      accounts: {
        mnemonic: process.env.MNEMONIC_RINKEBY,
      },
    },
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_LOCAL,
        blockNumber: 11095000,
      },
    },
  },
};
