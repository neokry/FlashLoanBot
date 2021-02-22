// uni/sushiswap ABIs
const UniswapV2Pair = require("../../arbitrage-bot/abis/IUniswapV2Pair.json");
const UniswapV2Factory = require("../../arbitrage-bot/abis/IUniswapV2Factory.json");

// scripts/index.js
async function main() {
  const sushiFactory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
  const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const sushiRouterAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

  const address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const FlashLoaner = await ethers.getContractFactory("FlashLoaner");
  const flashLoaner = await FlashLoaner.attach(address);
  await flashLoaner.setDEX(sushiFactory, uniRouter);

  console.log("Dex is swapped");

  const factory = await flashLoaner.dexFactory();
  if (factory != sushiFactory) {
    console.log("Dex factory is wrong ", factory);
  } else {
    console.log("Dex factory is set");
  }

  const router = await flashLoaner.dexRouter();
  if (router != uniRouter) {
    console.log("Dex factory is wrong ", router);
  } else {
    console.log("Dex router is set");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
