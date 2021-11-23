const { Requester, Validator } = require('@chainlink/external-adapter')

const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const customParams = {
  module: false,
  action: false,
  apikey: ['apikey', 'key'],
  endpoint: false
}

const createRequest = (input, callback) => {
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const endpoint = validator.validated.data.endpoint || 'api'
  const url = `https://api.etherscan.io/${endpoint}`
  const module = validator.validated.data.module || 'stats'
  const action = validator.validated.data.action || 'ethprice'
  const apikey = validator.validated.data.apikey;

  const params = {
    module,
    action,
    apikey
  }

  const config = {
    url,
    params
  }

  console.log(config)

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      
      response.data.result = Requester.validateResultNumber(response.data, ['result','ethusd'])
      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
