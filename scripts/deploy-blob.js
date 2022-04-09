// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('The deployer address is:', signer.address);

  const balance = await signer.getBalance();
  console.log('balance:', ethers.utils.formatEther(balance));

  const Blob = await hre.ethers.getContractFactory("Blob");

  let proxyAddress = "0x0000000000000000000000000000000000000000";
  if (hre.network.name == "matic") {
    proxyAddress = "0x58807baD0B376efc12F5AD86aAc70E78ed67deaE";
    console.log(`Using proxy ${proxyAddress} for Matic`);
  } else if (hre.network.name == "mumbai") {
    proxyAddress = "0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c";
    console.log(`Using proxy ${proxyAddress} for Mumbai`);
  } else {
    console.log(`Setting proxy to ${proxyAddress} (proxy for network`, hre.network.name, 'not set)');
  }

  const blob = await Blob.deploy(proxyAddress);
  await blob.deployed();
  console.log("Blob deployed to:", blob.address);
  return [Blob, blob];
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = function() {
  this.hre = hre;
  this.main = main;
}