const hre = require('hardhat');
const { ethers } = hre;
const { use, expect } = require('chai');
const { solidity } = require("ethereum-waffle");


use(solidity)

describe("Blob contract", function() {
  let blob;

  it("deploys correctly", async function () {
      const BlobFactory = await ethers.getContractFactory("Blob");
      blob = await BlobFactory.deploy("0x0000000000000000000000000000000000000000");
  });

  it("deploys correctly", async function () {
      const BlobFactory = await ethers.getContractFactory("Blob");
      blob = await BlobFactory.deploy("0x0000000000000000000000000000000000000000");
  });
});
