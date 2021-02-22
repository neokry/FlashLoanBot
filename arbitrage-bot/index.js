require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
const flashLoanerAddress = process.env.FLASH_LOANER;

const { ethers } = require("ethers");

// uni/sushiswap ABIs
const UniswapV2Pair = require("./abis/IUniswapV2Pair.json");
const UniswapV2Factory = require("./abis/IUniswapV2Factory.json");

const TokenList = require("./tokenList.json");

const uniPairs = new Map();
const sushiPairs = new Map();

const provider = new ethers.providers.InfuraProvider(
  "mainnet",
  process.env.INFURA_KEY
);

const wallet = new ethers.Wallet(privateKey, provider);

const ETH_TRADE = 1000;
const DAI_TRADE = 35000;

const runBot = async () => {
  const sushiFactory = new ethers.Contract(
    "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    UniswapV2Factory.abi,
    wallet
  );
  const uniswapFactory = new ethers.Contract(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    UniswapV2Factory.abi,
    wallet
  );

  const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  const loadPairs = async () => {
    console.log("initilizing token pairs... \n");

    await TokenList.map(async (token) => {
      try {
        const sushiTokenPair = new ethers.Contract(
          await sushiFactory.getPair(wethAddress, token.address),
          UniswapV2Pair.abi,
          wallet
        );

        const uniswapTokenPair = new ethers.Contract(
          await uniswapFactory.getPair(wethAddress, token.address),
          UniswapV2Pair.abi,
          wallet
        );
        sushiPairs.set(token.address, sushiTokenPair);
        uniPairs.set(token.address, uniswapTokenPair);
      } catch (err) {
        console.log(
          `Error loading pairs for token ${token.symbol} err: ${err}`
        );
      }
    });
  };

  const checkSwap = async (token) => {
    try {
      const sushiReserves = await sushiPairs.get(token.address).getReserves();
      const uniswapReserves = await uniPairs.get(token.address).getReserves();

      const reserve0Sushi = Number(
        ethers.utils.formatUnits(sushiReserves[0], 18)
      );

      const reserve1Sushi = Number(
        ethers.utils.formatUnits(sushiReserves[1], 18)
      );

      const reserve0Uni = Number(
        ethers.utils.formatUnits(uniswapReserves[0], 18)
      );
      const reserve1Uni = Number(
        ethers.utils.formatUnits(uniswapReserves[1], 18)
      );

      const priceUniswap = reserve0Uni / reserve1Uni;
      const priceSushiswap = reserve0Sushi / reserve1Sushi;

      const shouldStartEth = priceUniswap < priceSushiswap;
      const spread = Math.abs((priceSushiswap / priceUniswap - 1) * 100) - 0.6;

      const shouldTrade =
        spread >
        (shouldStartEth ? ETH_TRADE : DAI_TRADE) /
          Number(
            ethers.utils.formatEther(uniswapReserves[shouldStartEth ? 1 : 0])
          );

      console.log(`COIN ${token.symbol}`);
      console.log(`UNISWAP PRICE ${priceUniswap}`);
      console.log(`SUSHISWAP PRICE ${priceSushiswap}`);
      console.log(`PROFITABLE? ${shouldTrade}`);
      console.log(
        `CURRENT SPREAD: ${(priceSushiswap / priceUniswap - 1) * 100}%`
      );
      console.log(`ABSLUTE SPREAD: ${spread} \n`);

      return { shouldTrade, shouldStartEth, priceUniswap, spread };
    } catch (err) {
      console.log(
        `Error getting pair with token ${token.symbol} err: ${err} \n`
      );
      return {
        shouldTrade: false,
        shouldStartEth: false,
        priceUniswap: 0,
        spread: 0,
      };
    }
  };

  const makeTrade = async (shouldStartEth, token, priceUniswap, spread) => {
    try {
      const pairContract = uniPairs.get(token.address);

      const gasLimit = await pairContract.estimateGas.swap(
        !shouldStartEth ? DAI_TRADE : 0,
        shouldStartEth ? ETH_TRADE : 0,
        flashLoanerAddress,
        ethers.utils.toUtf8Bytes("1")
      );

      const gasPrice = await wallet.getGasPrice();

      const gasCost = Number(ethers.utils.formatEther(gasPrice.mul(gasLimit)));

      const shouldSendTx = shouldStartEth
        ? gasCost / ETH_TRADE < spread
        : gasCost / (DAI_TRADE / priceUniswap) < spread;

      // don't trade if gasCost is higher than the spread
      if (!shouldSendTx) {
        console.log(`❌ Gas cost too high!! price: ${gasCost} \n`);
        return;
      }

      const options = {
        gasPrice,
        gasLimit,
      };

      const tx = await pairContract.swap(
        !shouldStartEth ? DAI_TRADE : 0,
        shouldStartEth ? ETH_TRADE : 0,
        flashLoanerAddress,
        ethers.utils.toUtf8Bytes("1"),
        options
      );

      console.log("🟡 ARBITRAGE EXECUTED! PENDING TX TO BE MINED");
      console.log(tx);

      await tx.wait();

      const tradeValue = shouldStartEth
        ? spread - gasCost / ETH_TRADE
        : spread - gasCost / (DAI_TRADE / priceUniswap);

      console.log(
        `✅  SUCCESS! TX MINED trade value: ${tradeValue} token: ${token.symbol} \n`
      );
    } catch (err) {
      console.log(
        `Error making trade with coin ${token.symbol} err: ${err} \n`
      );
    }
  };

  await loadPairs();

  provider.on("block", async (blockNumber) => {
    try {
      console.log(blockNumber);

      if (
        uniPairs.size < TokenList.length ||
        sushiPairs.size < TokenList.length
      ) {
        console.log("Waiting for pairs to init");
        return;
      }

      TokenList.map(async (token) => {
        const {
          shouldTrade,
          shouldStartEth,
          priceUniswap,
          spread,
        } = await checkSwap(token);
        if (shouldTrade)
          await makeTrade(shouldStartEth, token, priceUniswap, spread);
      });
    } catch (err) {
      console.error(err);
    }
  });
};

console.log("Bot started!");

runBot();
