require('dotenv').config()

const marketplace = require('./services/marketplace')

const execute = async () => {
  await marketplace.sellAndBuy()
}

execute()
  .then(() => {
    console.log('Done!')
  })
  .catch(e => {
    console.log(e)
  })
