const hre = require("hardhat");

async function main() {
  const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const sushiRouterAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

  console.log("Deploying FlashLoaner");

  // We get the contract to deploy
  const FlashLoaner = await hre.ethers.getContractFactory("FlashLoaner");
  const gasLimit = await FlashLoaner.estimateGas.deploy(
    uniFactoryAddress,
    sushiRouterAddress
  );

  const provider = new ethers.providers.AlchemyProvider(
    "mainnet",
    "s159m0bS3EQblyvf_j-9JLtv4hg1HwxZ"
  );

  const wallet = new ethers.Wallet(
    "0x2fd0146b5893f856fa8094512a479fced59c3ac4aa85ed4a2c647a857582434f",
    provider
  );

  const gasPrice = await wallet.getGasPrice();
  const gasCost = Number(ethers.utils.formatEther(gasPrice.mul(gasLimit)));

  console.log("Deployment costs:", gasCost);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
