// uni/sushiswap ABIs
const UniswapV2Pair = require("../../arbitrage-bot/abis/IUniswapV2Pair.json");
const UniswapV2Factory = require("../../arbitrage-bot/abis/IUniswapV2Factory.json");
const { BigNumber, utils } = require("ethers");
const { ethers } = require("hardhat");

// scripts/index.js
async function main() {
  console.log("Bot started");

  const address = "0x8C8C8766D9f50a4fC8466aD1e512A9061dfab86d";

  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    "s159m0bS3EQblyvf_j-9JLtv4hg1HwxZ"
  );

  const wallet = new ethers.Wallet(
    "0x2fd0146b5893f856fa8094512a479fced59c3ac4aa85ed4a2c647a857582434f",
    provider
  );

  const walletBalance = await wallet.getBalance();

  console.log("Wallet created with balance:", walletBalance);

  const daiAddress = "0x95b58a6bff3d14b7db2f5cb5f0ad413dc2940658";
  const wethAddress = "0xc778417e063141139fce010982780140aa0cd5ab";

  const uniFactory = new ethers.Contract(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    UniswapV2Factory.abi,
    wallet
  );

  console.log("Uni found");

  const pair = await uniFactory.getPair(wethAddress, daiAddress);

  console.log("Pair found", pair);

  const uniEthDai = await ethers.getContractAt(UniswapV2Pair.abi, pair);

  console.log("Pair created");

  const accounts = await ethers.provider.listAccounts();
  const balance = (await ethers.provider.getBalance(accounts[0])).toString();

  console.log("account balance", balance);

  const gasPrice = await wallet.getGasPrice();

  console.log("gas price", gasPrice);

  const options = {
    gasPrice: gasPrice.mul(10),
    gasLimit: 21000 + 68 * 100000,
  };

  const tx = await uniEthDai.swap(
    0,
    1,
    address,
    ethers.utils.toUtf8Bytes("1"),
    options
  );

  console.log("Swap requested");

  await tx.wait();

  console.log("Swap accepted");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
