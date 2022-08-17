const ethers = require('ethers')

const createContractSignedData = async ({
  contractAddress,
  chainId,
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
    verifyingContract: contractAddress,
    chainId: ethers.BigNumber.from(chainId)
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
