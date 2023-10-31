const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const { assert, expect } = require("chai");
// const {
//   developmentChains,
//   networkConfig,
// } = require("../../helper-hardhat-config");

describe("Raffle unit tests", function () {
  let deployer;
  let FractionAsset, FractionalAsset;
  const sendValue = ethers.parseEther("2");
  const chainId = network.config.chainId;
  console.log("Hey there!");

  function areArraysEqual(arr1, arr2) {
    return (
      arr1.length === arr2.length &&
      arr1.every((element, index) => {
        const element2 = arr2[index];
        if (Array.isArray(element)) {
          return areArraysEqual(element, element2);
        } else if (typeof element === "bigint") {
          return element === BigInt(element2);
        } else {
          return element === element2;
        }
      })
    );
  }

  function calcShares(propVal, amount) {
    let x = 100 * amount;
    return x / propVal;
  }

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    console.log(deployer);
    console.log("Okay...");

    FractionAsset = await deployments.get("AssetBloc", deployer);
    // console.log(FractionAsset.address);
    FractionalAsset = await ethers.getContractAt(
      "AssetBloc",
      FractionAsset.address
    );
    console.log(FractionalAsset.target);
  });

  describe("Constructor", function () {
    it("sets only owner", async function () {
      const owner = await FractionalAsset.getOwner(); // This is an enum but it returns the index i.e 0=OPEN & 1=CALCULATING
      //   console.log(raffleState);
      assert.equal(owner, deployer);
    });
  });

  describe("Deposits and Registers Users", function () {
    it("deposits and only owner can call contract balance", async function () {
      await FractionalAsset.deposit({ value: sendValue });
      const response = await FractionalAsset.getContractBalance();
      assert.equal(response, sendValue);
      const accounts = await ethers.getSigners();
      const NotOwner = await FractionalAsset.connect(accounts[1]);
      await expect(NotOwner.getContractBalance()).to.be.revertedWith(
        "Not Owner"
      );
    });
    it("updates users balance", async function () {
      await FractionalAsset.deposit({ value: ethers.parseEther("0.06") });
      const accounts = await ethers.getSigners();
      const NotOwner = await FractionalAsset.connect(accounts[1]);
      await NotOwner.deposit({ value: sendValue });
      const response = await NotOwner.getUserBalance();
      assert.equal(response, sendValue);
    });
  });

  describe("Add and Edits Assets", function () {
    it("adds assets", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 20, 2, 3);
      const addedAsset = await FractionalAsset.getAssetById(1);
      const expectedAsset = [
        1,
        "Light House",
        "In Lagos",
        20 * 10 ** 18,
        100,
        0,
        2,
        3 * 10 ** 18,
        0,
        0,
        deployer,
        false,
      ];
      const result = areArraysEqual(addedAsset, expectedAsset);
      assert.equal(result, true);
    });
    it("edits assets", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 20, 2, 3);
      await FractionalAsset.editAsset(
        1,
        "House Of Light",
        "In Lagos",
        25,
        2,
        4
      );
      const addedAsset = await FractionalAsset.getAssetById(1);
      const expectedAsset = [
        1,
        "House Of Light",
        "In Lagos",
        25 * 10 ** 18,
        100,
        0,
        2,
        4 * 10 ** 18,
        0,
        0,
        deployer,
        false,
      ];
      const result = areArraysEqual(addedAsset, expectedAsset);
      assert.equal(result, true);
    });
  });

  describe("Buy Shares", function () {
    it("reverts if shares are not available", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 2, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 2);
      const accounts = await ethers.getSigners();
      const NotOwner = await FractionalAsset.connect(accounts[1]);
      await NotOwner.deposit({ value: sendValue });
      await expect(NotOwner.buyShares(1, 1)).to.be.revertedWith(
        "Shares amount not available"
      );
    });
    it("reverts if funds is not enough", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await expect(FractionalAsset.buyShares(1, 3)).to.be.revertedWith(
        "Insufficient funds"
      );
    });
    it("updates users main balance and shares balance,", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 2, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 1);
      const response = await FractionalAsset.getUserBalance();
      const sharesResponse = await FractionalAsset.getUserShares();
      assert.equal(sharesResponse[0][4], ethers.parseEther("1"));
      assert.equal(response, ethers.parseEther("1"));
    });
    it("updates shares available and shares sold for an asset", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 2, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 1);
      const availableShares = await FractionalAsset.getSharesAvailable(1);
      const sharesSold = await FractionalAsset.getSharesSold(1);
      assert.equal(availableShares, 50);
      assert.equal(sharesSold, 50);
    });
    it("updates asset owners array", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 2, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 1);
      const sharesResult = calcShares(2 * 10 ** 18, 1 * 10 ** 18);
      const response = await FractionalAsset.getAssetOwners(1);
      const expectedResponse = [[1, deployer, sharesResult]];
      const result = areArraysEqual(response, expectedResponse);
      assert.equal(result, true);
    });
  });

  describe("Sell shares", function () {
    it("updates users main balance and shares balance", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 2);
      await FractionalAsset.sellShares(1, 1);
      const response = await FractionalAsset.getUserBalance();
      const sharesResponse = await FractionalAsset.getUserShares();
      assert.equal(sharesResponse[0][4], ethers.parseEther("1"));
      assert.equal(response, ethers.parseEther("1"));
    });
    it("updates shares available and shares sold for an asset", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: ethers.parseEther("4") });
      await FractionalAsset.buyShares(1, 3);
      await FractionalAsset.sellShares(1, 1);
      const availableShares = await FractionalAsset.getSharesAvailable(1);
      const sharesSold = await FractionalAsset.getSharesSold(1);
      assert.equal(availableShares, 25);
      assert.equal(sharesSold, 75);
    });
  });

  describe("Lock Shares", function () {
    it("reverts if caller is not a shareholder", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await expect(FractionalAsset.lockShares(1, 1, 7)).to.be.revertedWith(
        "Not an asset owner!"
      );
    });
    it("locks shares", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 2);
      await FractionalAsset.lockShares(1, 1, 7);
      const sharesResponse = await FractionalAsset.getUserShares();
      assert.equal(sharesResponse[0][5], ethers.parseEther("1"));
      assert.equal(sharesResponse[0][6], 7);
    });
  });

  describe("Unlock Shares", function () {
    it("reverts if caller is not a shareholder", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await expect(FractionalAsset.unlockShares(1)).to.be.revertedWith(
        "Not an asset owner!"
      );
    });
    it("rests locked and locked time", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      await FractionalAsset.deposit({ value: sendValue });
      await FractionalAsset.buyShares(1, 2);
      await FractionalAsset.lockShares(1, 1, 1);
      await FractionalAsset.unlockShares(1);
      const sharesResponse = await FractionalAsset.getUserShares();
      assert.equal(sharesResponse[0][5], 0);
      assert.equal(sharesResponse[0][6], 0);
    });
  });

  describe("Rents, pays and distribute profits", function () {
    it("Rents", async function () {
      await FractionalAsset.addAsset("Light House", "In Lagos", 4, 2, 3);
      // await FractionalAsset.deposit({ value: sendValue });
      await expect(
        FractionalAsset.rentShare(1, { value: sendValue })
      ).to.be.revertedWith("Insufficient funds");
      const response = await FractionalAsset.getAssetById(1);
      assert.equal(response[0][10], deployer);
      assert.equal(response[0][11], true);
      console.log(response);
    });
  });
});
