const contractConfig = require('../configs/contracts')
const { providerConfig } = require('../configs/providers')

const { getContract } = require('../libs/contract')
const { getProvider } = require('../libs/provider')
const { createContractSignedData } = require('../libs/signature')

const { getSigners, getSignerAddresses } = require('./signer')

const [signerA, signerB, signerC, signerCohart] = getSigners()
const [addressA, addressB, addressC, addressCohart] = getSignerAddresses()

const provider = getProvider(
  providerConfig.rinkeby.rpc,
  providerConfig.rinkeby.chainId,
  providerConfig.rinkeby.name
)

const mintingContract = getContract(
  contractConfig.erc721.rinkeby.address,
  contractConfig.erc721.rinkeby.abi
)

const marketplace = getContract(
  contractConfig.marketplace.rinkeby.address,
  contractConfig.marketplace.rinkeby.abi
)

const seller = signerA
const buyer = signerB

const sellerAddress = seller.address

async function listNftToSell(signatureTypes, signatureData) {
  // approve marketplace to transfer seller nft
  await (async () => {
    const isApprovedToSaleBefore = await mintingContract.isApprovedForAll(
      sellerAddress,
      marketplace.address
    )
    console.log('isApprovedForAll before', isApprovedToSaleBefore)
    if (isApprovedToSaleBefore) return // don't need to set approval if user has already done it before
    try {
      const tx = await mintingContract
        .connect(seller)
        .setApprovalForAll(marketplace.address, true)
      await tx.wait()
    } catch (e) {
      console.log(e)
    }

    const isApprovedToSaleAfter = await mintingContract.isApprovedForAll(
      sellerAddress,
      marketplace.address
    )
    console.log('isApprovedForAll after', isApprovedToSaleAfter)
  })()

  const sellerSignedData = await createContractSignedData({
    contract: marketplace,
    signer: seller,
    provider: provider,
    signData: signatureData,
    signTypes: signatureTypes,
    domainName: 'COHART-Marketplace',
    domainVersion: '1',
    signaturePropName: 'signature'
  })

  const cohartSignedData = await createContractSignedData({
    contract: marketplace,
    signer: signerCohart,
    provider: provider,
    signData: sellerSignedData,
    signTypes: signatureTypes,
    domainName: 'COHART-Marketplace',
    domainVersion: '1',
    signaturePropName: 'cohartSignature'
  })

  const isSaleAble = await marketplace.Saleable(cohartSignedData)

  console.log('marketplace.Saleable()', isSaleAble)

  console.log('\n-- Match the seller and buyer --')
  const tx = await marketplace
    .connect(buyer)
    .Match(buyer.address, cohartSignedData, { value: cohartSignedData.price })
  await tx.wait()

  // NFT owner: ${await mintingContract.ownerOf(SellerSign.ERC721_tokenId)}`)
  // await getBalanceTable(provider, accounts)
}

// async function main_() {
//   const [
//     deployer,
//     seller,
//     buyer,
//     creator,
//     addr2,
//     addr3,
//     admin,
//     backendPrivateKey
//   ] = await ethers.getSigners()

//   console.log(deployer.address)

//   // Deploy ERC721
//   const ERC721Factory = await ethers.getContractFactory(
//     'ExampleERC721',
//     deployer
//   )
//   ERC721 = await ERC721Factory.deploy(
//     deployer.address,
//     1000,
//     'https://nft.cohart.co/NFT/testing/HardhatTest.json'
//   )
//   console.log('ERC721 deployed to:', ERC721.address)

//   // Deploy Marketplace
//   const Marketplace = await ethers.getContractFactory(
//     'EthMarketplace',
//     deployer
//   )

//   console.log('Deploying Marketplace...')
//   let marketplace = await Marketplace.deploy(admin.address)
//   await marketplace.deployed()
//   console.log('Contract deployed to:', marketplace.address)

//   let types = {
//     SellerSign: [
//       { name: 'ERC721_Contract', type: 'address' },
//       { name: 'ERC721_tokenId', type: 'uint256' },
//       { name: 'due', type: 'uint256' },
//       { name: 'seller', type: 'address' },
//       { name: 'price', type: 'uint256' },
//       { name: 'creator', type: 'address' },
//       { name: 'creatorFeeNumerator', type: 'uint256' }
//     ]
//   }

//   // MintERC721
//   await ERC721.mint(seller.address, 0, '', seller.address, 1000)

//   let data = {
//     ERC721_Contract: ERC721.address,
//     ERC721_tokenId: 0,
//     due: parseInt((Date.now() + 86400) / 1000), // 1 day
//     seller: seller.address,
//     price: '1000000000000000000000',
//     creator: creator.address,
//     creatorFeeNumerator: 1000 // 10% , 1000/10000
//   }

//   // Create a voucher for buyer to use
//   console.log('---')
//   let signatureMaker = new SignatureMaker({
//     contract: marketplace,
//     signer: seller,
//     SIGNING_DOMAIN_NAME: 'COHART-Marketplace',
//     SIGNING_DOMAIN_VERSION: '1'
//   })

//   let CohartSignatureMaker = new SignatureMaker({
//     contract: marketplace,
//     signer: backendPrivateKey,
//     SIGNING_DOMAIN_NAME: 'COHART-Marketplace',
//     SIGNING_DOMAIN_VERSION: '1'
//   })

//   let SellerSign = await signatureMaker.createSignedData(
//     (args = data),
//     (types = types),
//     (signaturePropertyName = 'signature')
//   )
//   SellerSign = await CohartSignatureMaker.createSignedData(
//     (args = SellerSign),
//     (types = types),
//     (signaturePropertyName = 'cohartSignature')
//   )

//   console.log('marketplace.Saleable()', await marketplace.Saleable(SellerSign))

//   tx = await ERC721.connect(seller).setApprovalForAll(marketplace.address, true)
//   await tx.wait()
//   console.log(
//     'ERC721.connect(seller).setApprovalForAll(marketplace.address, true)'
//   )

//   console.log('marketplace.Saleable()', await marketplace.Saleable(SellerSign))
//   // still false, because backendPrivateKey need to be assigned as cohart_signer
//   console.log(
//     'marketplace.connect(admin).grantRole(COHART_SIGNER, backendPrivateKey)'
//   )
//   tx = await marketplace
//     .connect(admin)
//     .grantRole(await marketplace.COHART_SIGNER(), backendPrivateKey.address)
//   await tx.wait()
//   console.log('marketplace.Saleable()', await marketplace.Saleable(SellerSign))
//   // true

//   console.log('\n-- Match the seller and buyer --')
//   accounts = [seller, buyer, creator, admin, marketplace]
//   account_names = 'seller, buyer, creator, admin, marketplace'.split(', ')
//   console.log(`Before:
//   NFT owner: ${await ERC721.ownerOf(SellerSign.ERC721_tokenId)}`)
//   await getBalanceTable(provider, accounts)
//   tx = await marketplace
//     .connect(buyer)
//     .Match(buyer.address, SellerSign, { value: SellerSign.price })
//   tx = await tx.wait()
//   console.log(`Match Gas: ${tx.cumulativeGasUsed.toString()}`)
//   console.log(`After:
//   NFT owner: ${await ERC721.ownerOf(SellerSign.ERC721_tokenId)}`)
//   await getBalanceTable(provider, accounts)
// }

const buyNft = async () => {
  console.log('buy sell nft')
}

module.exports = {
  listNftToSell,
  buyNft
}
