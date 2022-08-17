const { ethers } = require('ethers')

function getSigner(privateKey) {
  const wallet = new ethers.Wallet(privateKey)
  return wallet
}

function getSigners() {
  const signers = [
    getSigner(process.env.PRIVATE_KEY_PERSON_A),
    getSigner(process.env.PRIVATE_KEY_PERSON_B),
    getSigner(process.env.PRIVATE_KEY_PERSON_C),
    getSigner(process.env.PRIVATE_KEY_COHART_BACKEND)
  ]
  return signers
}

function getSignerAddresses() {
  const signerAddresses = [
    process.env.ADDRESS_PERSON_A,
    process.env.ADDRESS_PERSON_B,
    process.env.ADDRESS_PERSON_C,
    process.env.ADDRESS_COHART_BACKEND
  ]
  return signerAddresses
}

module.exports = {
  getSigners,
  getSignerAddresses
}
