const { ethers } = require('ethers')

const getContract = (contractAddress, contractABI) => {
  const contract = new ethers.Contract(contractAddress, contractABI)
  return contract
}

module.exports = {
  getContract
}
