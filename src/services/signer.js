const { ethers } = require('ethers')

function getSigner(privateKey, provider = undefined) {
  const wallet = new ethers.Wallet(privateKey, provider)
  return wallet
}

function getSigners(provider) {
  const signers = [
    getSigner(process.env.PRIVATE_KEY_PERSON_A, provider),
    getSigner(process.env.PRIVATE_KEY_PERSON_B, provider),
    getSigner(process.env.PRIVATE_KEY_PERSON_C, provider),
    getSigner(process.env.PRIVATE_KEY_COHART_BACKEND, provider)
  ]
  return signers
}

module.exports = {
  getSigners
}
