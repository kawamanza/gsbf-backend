const axios = require('axios')
const fs = require('fs')
const path = require('path')

module.exports = app => {
    const { linkUrl } = app.config.utils

    function root(req, res) {
        res.json({
            title: "GSBF API",
            version: "1.0.0",
            _links: {
                self: {href: linkUrl(req, '/', {})},
                products:  {href: linkUrl(req, '/products', {})},
            }
        })
    }

    const hours_ago_in_millis = 60 * 60 * 1000
    async function currencies(req, res) {
        let layer = app.config.currencylayer
        const stale = (new Date() - layer.timestamp * 1000) > 8 * hours_ago_in_millis
        if (stale && req.query.token) {
            const token = req.query.token   // Token para teste: 'ab52e4a2a6ebd5462c96a1872402c3b1'
            const url = `http://api.currencylayer.com/live?access_key=${token}&format=1`
            const result = await axios.get(url)
            app.config.currencylayer = layer = result.data
            setTimeout(() => {
                const currency_filepath = path.resolve(__dirname + '/../config/currencylayer.json')
                fs.writeFileSync(currency_filepath, JSON.stringify(layer, null, 2))
            }, 500)
            res.status(302)
            res.setHeader('Location', linkUrl(req, '/currencies', {}))
            res.setHeader('Cache-Control', 'no-cache, no-store, private')
            return res.end()
        }
        res.json({
            age: Math.floor((new Date() - layer.timestamp * 1000) / 1000),  // seconds
            stale,
            layer,
            _links: {
                root: {href: linkUrl(req, '/', {})},
            }
        })
    }

    return { root, currencies }
}
