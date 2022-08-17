const { ethers } = require('ethers')
const ExampleERC721 = require('../abis/ExampleERC721.json')
const EthMarketplace = require('../abis/EthMarketplace.json')

const erc721 = {
  rinkeby: {
    // address: '0xf06700bfdf18938b432b088b26646ea96be03443',
    address: '0xF06700bfdf18938b432b088B26646ea96be03443',
    abi: ExampleERC721
  }
}

const marketplace = {
  rinkeby: {
    address: '0x478AE74346e882fA5A48c3d9Dc1947eEbA33FB1E',
    abi: EthMarketplace
  }
}

module.exports = {
  erc721,
  marketplace
}
