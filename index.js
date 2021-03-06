const express = require('express')
const consign = require('consign')
const app = express()
const port = 3000

require('./config/mongodb')
app.mongoose = require('mongoose')

consign()
    .include('./config/middlewares.js')
    .then('./config/utils.js')
    .then('./api')
    .then('./config/routes.js')
    .then('./config')
    .into(app)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
