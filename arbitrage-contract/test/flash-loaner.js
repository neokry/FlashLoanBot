const { expect } = require("chai");

describe("FlashLoaner", function () {
  let FlashLoaner;
  let flashLoaner;

  before(async function () {
    this.FlashLoaner = await ethers.getContractFactory("FlashLoaner");
  });

  beforeEach(async function () {
    const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const sushiRouterAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

    this.flashLoaner = await this.FlashLoaner.deploy(
      uniFactoryAddress,
      sushiRouterAddress
    );
    await this.flashLoaner.deployed();
  });

  it("Should set dex", async function () {
    const sushiFactory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
    const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    await this.flashLoaner.setDEX(sushiFactory, uniRouter);

    expect(await this.flashLoaner.dexFactory()).to.equal(sushiFactory);
    expect(await this.flashLoaner.dexRouter()).to.equal(uniRouter);
  });

  it("Should set owner", async function () {
    const newOwner = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    await this.flashLoaner.setOwner(newOwner);

    expect(await this.flashLoaner.owner()).to.equal(newOwner);
  });

  it("Should enfore authorization", async function () {
    const newOwner = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    await this.flashLoaner.setOwner(newOwner);

    expect(await this.flashLoaner.owner()).to.equal(newOwner);

    await expect(this.flashLoaner.setOwner(newOwner)).to.be.revertedWith(
      "Unathorized"
    );

    const sushiFactory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
    const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    await expect(
      this.flashLoaner.setDEX(sushiFactory, uniRouter)
    ).to.be.revertedWith("Unathorized");
  });
});
