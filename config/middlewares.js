const morgan = require('morgan')
const bodyParser = require('body-parser')

module.exports = app => {
    app.use(morgan('tiny'))
    app.use(bodyParser.json({type: ['application/*+json', 'application/json']}))
}
