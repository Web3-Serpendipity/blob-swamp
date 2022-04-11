const hre = require('hardhat');
const { ethers } = hre;
const { use, expect } = require('chai');
const { solidity } = require("ethereum-waffle");


use(solidity)

describe("Blob contract", function() {
  let blob;

  if (process.env.CONTRACT_ADDRESS) {
    it("Should connect to external contract", async function () {
      blob = await ethers.getContractAt("Blob",process.env.CONTRACT_ADDRESS);
      console.log("Connected to external contract",blob.address)
    });
  } else {
    it("Should deploy", async function () {
      const BlobFactory = await ethers.getContractFactory("Blob");
      blob = await BlobFactory.deploy("0x0000000000000000000000000000000000000000");
    });
  }

  describe('mint()', function() {
    it('should be able to mint 3 nfts', async function() {
      const [owner] = await ethers.getSigners();
      console.log('\t', 'tester/deployer address', owner.address);

      const startingBalance = await blob.balanceOf(owner.address);
      console.log('\t', 'startingBalance', startingBalance);

      const mintTx = await blob.mint(owner.address, 3, {value: ethers.utils.parseEther("0.03")});
      console.log('\t', 'meeeeeeenting tx', mintTx.hash);

      const txResult = await mintTx.wait();
      expect(txResult.status).to.equal(1);

      console.log('\t', 'checking new balance');
      expect(await blob.balanceOf(owner.address)).to.equal(
        startingBalance.add(3)
      );
    });

/*
    it('should NOT be able to mint 101 nfts', async function() {
      const [owner] = await ethers.getSigners();
      console.log('\t', 'tester/deployer address', owner.address);

      const startingBalance = await blob.balanceOf(owner.address);
      console.log('\t', 'startingBalance', startingBalance);

      const mintTx = await blob.mint(owner.address, 101, {value: ethers.utils.parseEther("0.11")});
      console.log('\t', 'meeeeeeenting tx', mintTx.hash);

      var succ = false;

      try {
        const txResult = await mintTx.wait();
        succ = true;
      } catch (err) {
        console.log('minting failed as planned with error', err);
      }

      expect(succ).to.equal(false);

      console.log('\t', 'checking whether the balance has changed');
      expect(await blob.balanceOf(owner.address)).to.equal(startingBalance);
    });
*/

  });

});
