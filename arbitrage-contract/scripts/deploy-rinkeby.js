const hre = require("hardhat");

async function main() {
  const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const sushiRouterAddress = "0x617d8cA6b1A0F2cd0194e66544355EA3f7BdeeAa";

  console.log("Deploying FlashLoaner");

  // We get the contract to deploy
  const FlashLoaner = await hre.ethers.getContractFactory("FlashLoaner");
  const flashLoaner = await FlashLoaner.deploy(
    uniFactoryAddress,
    sushiRouterAddress
  );

  await flashLoaner.deployed();

  console.log("FlashLoaner deployed to:", flashLoaner.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
