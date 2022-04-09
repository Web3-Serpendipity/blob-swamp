const hre = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('The deployer address is:', signer.address);

  const balance = await signer.getBalance();
  console.log('balance:', ethers.utils.formatEther(balance));
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