require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "rinkeby",
  gasReporter: {
    currency: "USD",
    enabled: true,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      gasPrice: "auto",
      gasMultiplier: 2,
      chainId: 1337,
      allowUnlimitedContractSize: true
    },
    testnet: {
      // url: "//api-testnet.bscscan.com/api",
      // url: "https://api.avax-test.network/ext/bc/C/rpc",
      url: "https://avalanche--fuji--rpc.datahub.figment.io/apikey/ae004dbb64a040741f83e31cfea753ab/ext/bc/C/rpc",
      chainId: 43113,
      // chainId: 4,
      gasPrice: 25000000000,
      accounts: ["0xf576bed80e5e2dc45d9927e4730ac8f3560b71b76806be3358f8f7554dc0c400"]
    },
    // testnet: {
    //   // url: "//api-testnet.bscscan.com/api",
    //   url: "https://ropsten.infura.io/v3/47a395ded2ab403784b4d689f81795d7",
    //   chainId: 3,
    //   // chainId: 4,
    //   gasPrice: 20000000000,
    //   // accounts: ["0x2e1299451c0b25b9404ee3c20a2bc754380cf647c70e8fd21b2346615c4e9c47"]
    //   accounts: ["0xf576bed80e5e2dc45d9927e4730ac8f3560b71b76806be3358f8f7554dc0c400"]
    // },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: ["0xf576bed80e5e2dc45d9927e4730ac8f3560b71b76806be3358f8f7554dc0c400"]
    }
  },
  etherscan: {
    apiKey: 'ESYQTGRB9PHSNJ8YK3KX4NADRYDFVCEPKY'
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
                optimizerSteps: "dhfoDgvulfnTUtnIf"
              }
            }
          }
        },
      },
      {
        version: "0.5.16"
      },
      {
        version: "0.6.6"
      },
      {
        version: "0.6.12"
      }
    ]
  }
};
