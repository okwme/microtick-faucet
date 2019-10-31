const axios = require('axios')
require('dotenv').config()

const {
  // createCosmosAddress,
  sign,
  // createSignature,
  // createSignMessage,
  getNewWalletFromSeed,
  // generateSeed,
  // generateWallet,
  createSignedTx
  // createBroadcastBody
} = require('@lunie/cosmos-keys')
const GoogleRecaptcha = require('google-recaptcha')
const googleRecaptcha = new GoogleRecaptcha({
  secret: process.env.GOOGLE
})
const restEndpoint = 'http://mt-rest.okw.me'
let tx = {
  'chain_id': 'sf-blockchain-week',
  'account_number': '2',
  'sequence': null,
  'fee': {
    'amount': null,
    'gas': '200000'
  },
  'msgs': [
    {
      'type': 'cosmos-sdk/MsgSend',
      'value': {
        'from_address': process.env.address,
        'to_address': null,
        'amount': [
          {
            'denom': 'fox',
            'amount': '1'
          }
        ]
      }
    }
  ],
  'memo': ''
}

// generated from cli

// tx = {
//   'type': 'auth/StdTx',
//   'value': {
//     'msg': [
//       {
//         'type': 'cosmos-sdk/MsgSend',
//         'value': {
//           'from_address': 'cosmos1kwkllsq70dgcq78xrwra3nvnzrgj30tusjj957',
//           'to_address': 'cosmos1nx3e6j0yeckpdctg0xz8nc7tckz0aewlpx52xf',
//           'amount': [
//             {
//               'denom': 'fox',
//               'amount': '1'
//             }
//           ]
//         }
//       }
//     ],
//     'fee': {
//       'amount': null,
//       'gas': '200000'
//     },
//     'signatures': null,
//     'memo': ''
//   }
// }

// very old format below

// let tx = {
//   'msg': [
//     {
//       'type': 'cosmos-sdk/MsgSend',
//       'value': {
//         'from_address': process.env.address,
//         'to_address': null,
//         'amount': [
//           {
//             'denom': 'fox',
//             'amount': '1'
//           }
//         ]
//       }
//     }
//   ],
//   'fee': {
//     'amount': [
//       {
//         'denom': 'fox',
//         'amount': '1'
//       }
//     ],
//     'gas': '200000'
//   },
//   'signatures': null,
//   'memo': ''
// }
exports.handler = async function (event, context) {
  // let headers = {
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  //   'Access-Control-Allow-Headers':
  //     'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  // }
  if (event.httpMethod === 'POST') {
    if (event.body) {
      let body = JSON.parse(event.body)
      let recepient = body.recepient
      let recaptchaResponse = body.recaptchaToken
      let error
      // error = await new Promise((resolve, reject) => {
      //   googleRecaptcha.verify({ response: recaptchaResponse }, async (error) => {
      //     if (error) { reject(error) } else { resolve() }
      //   })
      // })
      if (error) {
        console.error(error)
        return {
          statusCode: 400,
          body: error.message
        }
      } else {
        try {
          // prepare tx
          const wallet = getNewWalletFromSeed(process.env.MNEMONIC)
          const requestMetadata = await getMetadata()
          console.log({requestMetadata})
          requestMetadata.chain_id = process.env.CHAIN_ID
          tx.msgs[0].value.to_address = recepient
          tx = createSignedTx(tx, sign(tx, wallet, requestMetadata))
          let body = {
            tx,
            return: 'block'
          }
          console.log({body})
          // send tx
          let res = await axios
            .post(
              restEndpoint + '/txs',
              body
            )
          console.log({res})
          return {
            statusCode: res.status,
            body: JSON.stringify(res.data)
          }
        } catch (error) {
          return handleAxiosError(error)
        }
      }
    } else {
      return {
        statusCode: 404,
        body: '¯\\_(ツ)_/¯'
      }
    }
  } else {
    return {
      statusCode: 200,
      body: ':)'
    }
  }
}

async function getMetadata () {
  let response = await axios.get(restEndpoint + '/auth/accounts/' + process.env.ADDRESS)
  return response.data.value
}

function handleAxiosError (error) {
  console.error(error)
  return {
    statusCode: !error.response ? 500 : error.response.status,
    body: !error.response ? error.message : error.response.statusText + (error.response.data && error.response.data.error ? '\n' + error.response.data.error : '')
  }
}
