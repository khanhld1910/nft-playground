require('dotenv').config()

const marketplace = require('./services/marketplace')
const { getSigners, getSignerAddresses } = require('./services/signer')

const execute = async () => {
  const [signerA, signerB, signerC, signerCohart] = getSigners()
  const [addressA, addressB, addressC, addressCohart] = getSignerAddresses()

  const seller = signerA
  const sellerAddress = addressA
  const buyer = signerB
  const buyerAddress = addressB

  const signatureType = {
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

  const due = Math.round(Date.now() / 1000 + 60 * 60 * 24).toString() // 1 day
  const signatureData = {
    ERC721_Contract: '0xf06700bfdf18938b432b088b26646ea96be03443',
    ERC721_tokenId: '3',
    due,
    seller: sellerAddress,
    price: '11000000000000000', // 0.011 ETH
    creator: '0x0E6C0e0685e505921Ab9a1A87A7665B8192A6330',
    creatorFeeNumerator: 1000 // 10% , 1000/10000
  }
  const a = await marketplace.listNftToSell(signatureType, signatureData)
}

execute()
  .then(() => {
    console.log('Done!')
  })
  .catch(e => {
    console.log(e)
    process.end(1)
  })
