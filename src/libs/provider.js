const { ethers } = require('ethers')

const getProvider = (rpc, chainId, name) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc, {
    chainId,
    name
  })
  return provider
}

module.exports = {
  getProvider
}
