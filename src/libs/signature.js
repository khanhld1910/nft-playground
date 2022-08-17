const ethers = require('ethers')

const createContractSignedData = async ({
  contract,
  provider,
  signer,
  domainName,
  domainVersion,
  signData = {},
  signTypes = {},
  signaturePropName = 'signature'
}) => {
  // TODO: Types check with args to avoid error
  const domain = {
    name: domainName,
    version: domainVersion,
    verifyingContract: contract.address,
    chainId: ethers.BigNumber.from(provider._network.chainId)
  }

  const signature = await signer._signTypedData(domain, signTypes, signData)
  const signedData = {
    ...signData,
    [signaturePropName]: signature
  }

  return signedData
}

module.exports = {
  createContractSignedData
}
