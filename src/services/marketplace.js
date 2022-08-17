const contractConfig = require('../configs/contracts')
const { providerConfig } = require('../configs/providers')

const { getContract } = require('../libs/contract')
const { getProvider } = require('../libs/provider')
const { createContractSignedData } = require('../libs/signature')

const { getSigners } = require('./signer')

const provider = getProvider(
  providerConfig.rinkeby.rpc,
  providerConfig.rinkeby.chainId,
  providerConfig.rinkeby.name
)

const [signerA, signerB, signerC, signerCohart] = getSigners(provider)
// const [addressA, addressB, addressC, addressCohart] = getSignerAddresses()

const mintingContract = getContract(
  contractConfig.erc721.rinkeby.address,
  contractConfig.erc721.rinkeby.abi
)

const marketplace = getContract(
  contractConfig.marketplace.rinkeby.address,
  contractConfig.marketplace.rinkeby.abi
)

const [seller, buyer] = [
  signerB, // the NFT is currently owned by this address
  signerA // will use this address to be buyer
]

const signatureTypes = {
  SellerSign: [
    { name: 'ERC721_Contract', type: 'address' },
    { name: 'ERC721_tokenId', type: 'uint256' },
    { name: 'due', type: 'uint256' },
    { name: 'seller', type: 'address' },
    { name: 'price', type: 'uint256' },
    { name: 'creator', type: 'address' },
    { name: 'creatorFeeNumerator', type: 'uint256' }
  ]
}

const due = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 30).toString() // 30 days
const signatureData = {
  ERC721_Contract: '0xf06700bfdf18938b432b088b26646ea96be03443',
  ERC721_tokenId: '3',
  due,
  seller: seller.address,
  price: '11000000000000000', // 0.011 ETH
  creator: '0x0E6C0e0685e505921Ab9a1A87A7665B8192A6330',
  creatorFeeNumerator: 1000 // 10% , 1000/10000
}

async function sellAndBuy() {
  // approve marketplace to transfer seller nft
  await (async () => {
    const isApprovedToSaleBefore = await mintingContract
      .connect(seller)
      .isApprovedForAll(sellerAddress, marketplace.address)

    console.log('isApprovedForAll before', isApprovedToSaleBefore)
    if (isApprovedToSaleBefore) return // don't need to set approval if user has already done it before
    try {
      console.log('approving...')
      const tx = await mintingContract
        .connect(seller)
        .setApprovalForAll(marketplace.address, true)
      await tx.wait()
    } catch (e) {
      console.log(e)
    }

    const isApprovedToSaleAfter = await mintingContract
      .connect(seller)
      .isApprovedForAll(sellerAddress, marketplace.address)

    console.log('isApprovedForAll after', isApprovedToSaleAfter)
  })()

  // sign data by seller
  const sellerSignedData = await createContractSignedData({
    contractAddress: marketplace.address,
    chainId: provider._network.chainId,
    signer: seller,
    signData: signatureData,
    signTypes: signatureTypes,
    domainName: 'COHART-Marketplace',
    domainVersion: '1',
    signaturePropName: 'signature'
  })
  // console.log('sellerSignedData', JSON.stringify(sellerSignedData, null, 2))

  // double sign again by Cohart
  const cohartSignedData = await createContractSignedData({
    contractAddress: marketplace.address,
    chainId: provider._network.chainId,
    signer: signerCohart,
    signData: sellerSignedData,
    signTypes: signatureTypes,
    domainName: 'COHART-Marketplace',
    domainVersion: '1',
    signaturePropName: 'cohartSignature'
  })
  // console.log('cohartSignedData', JSON.stringify(cohartSignedData, null, 2))

  // check if this 2level-signature is useable for sale
  await (async () => {
    const isSaleAble = await marketplace
      .connect(provider)
      .Saleable(cohartSignedData)
    console.log('marketplace.Saleable()', isSaleAble)
  })()

  console.log('seller Address', seller.address)
  console.log('buyer Address', buyer.address)

  await getTokenOwner(
    mintingContract.connect(provider),
    signatureData.ERC721_tokenId
  )

  console.log('Buyer use the signature to buy NFT')
  const tx = await marketplace
    .connect(buyer)
    .Match(buyer.address, cohartSignedData, { value: cohartSignedData.price })
  await tx.wait()

  await getTokenOwner(
    mintingContract.connect(provider),
    signatureData.ERC721_tokenId
  )
}

const getTokenOwner = async (mintingContract, tokenId) => {
  const owner = await mintingContract.ownerOf(tokenId)
  console.log("NFT's owner:", owner)
  return owner
}

module.exports = {
  sellAndBuy
}
