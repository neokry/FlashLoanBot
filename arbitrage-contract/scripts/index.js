// uni/sushiswap ABIs
const UniswapV2Pair = require("../../arbitrage-bot/abis/IUniswapV2Pair.json");
const UniswapV2Factory = require("../../arbitrage-bot/abis/IUniswapV2Factory.json");

// scripts/index.js
async function main() {
  console.log("Bot started");

  const address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  console.log("Wallet created");

  const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  const uniFactory = await ethers.getContractAt(
    UniswapV2Factory.abi,
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
  );

  console.log("uni found");

  const pair = await uniFactory.getPair(wethAddress, daiAddress);

  console.log("Pair found", pair);

  const uniEthDai = await ethers.getContractAt(UniswapV2Pair.abi, pair);

  console.log("Pair created");

  const gasLimit = await uniEthDai.estimateGas.swap(
    0,
    10,
    address,
    ethers.utils.toUtf8Bytes("1")
  );

  console.log("gasLimit", gasLimit);

  const tx = await uniEthDai.swap(
    0,
    10,
    address,
    ethers.utils.toUtf8Bytes("1")
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
