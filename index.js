const express = require('express')
const consign = require('consign')
const app = express()
const morgan = require('morgan')
const port = 3000

app.use(morgan('tiny'))

consign()
    .include('./api')
    .then('./config/routes.js')
    .into(app)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
