const { ethers } = require('ethers')

const providerConfig = {
  rinkeby: {
    name: 'rinkeby',
    chainId: 4,
    rpc: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    providers: {
      alchemy: 'NHtrW2ot39JGJC4Dt7_hXcNsG3B4tu3J' // FIXME: move to secrets
    }
  }
}

module.exports = {
  providerConfig
}
