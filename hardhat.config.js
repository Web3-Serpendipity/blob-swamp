require("@nomiclabs/hardhat-ethers");

const fs = require("fs");
function mnemonic() {
  return fs.readFileSync("./mnemonic.txt").toString().trim();
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  networks: {

    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      gasPrice: 3200000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    }

  }
};
