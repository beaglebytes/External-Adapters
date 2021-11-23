const dotenv = require("dotenv").config();
const createRequest = require('./index').createRequest

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8080

app.use(bodyParser.json())

app.post('/', (req, res) => {
  console.log('POST Data: ', req.body)
  createRequest(req.body, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)
  })
})
app.listen(port, () => console.log(`Listening on port ${port}!`))

// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"key": "810c2bd6-2454-4639-9f56-241a4f81b2df" } }'