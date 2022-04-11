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
  defaultNetwork: "mumbai",
  networks: {

    localhost: {
      url: "http://localhost:8545",
      /*      
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      
      */
    },

    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      //gasPrice: 3200000000, 8000000000
      accounts: {
        mnemonic: mnemonic(),
      },
    },

    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      gasPrice: 8000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    }

  },

  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    },
  }
};
