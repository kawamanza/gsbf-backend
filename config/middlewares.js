const morgan = require('morgan')
const express = require('express')
var cors = require('cors')

module.exports = app => {
    app.use(morgan('tiny'))
    app.use(express.json({type: ['application/*+json', 'application/json']}))
    app.use(cors())
}
