const hre = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('The deployer address is:', signer.address);

  const balance = await signer.getBalance();
  console.log('balance:', ethers.utils.formatEther(balance));

  const Blob = await hre.ethers.getContractFactory("Blob");
  const blob = new ethers.Contract("0x6E1A0dF83982551E7b5aAdb1f175B8A1061271Ef", Blob.interface, signer);
  await blob.mint("0xa8099485e72b7c54bA233e195FA3e0E650BCFF01", 3, {gasLimit: 42000});
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