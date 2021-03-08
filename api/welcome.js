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

    async function refreshCurrencies(token) {
        const url = `http://api.currencylayer.com/live?access_key=${token}&format=1`
        const result = await axios.get(url)
        app.config.currencylayer = result.data
        setTimeout(() => {
            const currency_filepath = path.resolve(__dirname + '/../config/currencylayer.json')
            fs.writeFileSync(currency_filepath, JSON.stringify(app.config.currencylayer, null, 2))
        }, 500)
    }

    async function currencies(req, res) {
        const age = Math.floor((new Date() - app.config.currencylayer.timestamp * 1000) / 1000)  // seconds
        const stale = age > 8 * 60 * 60
        if (req.query.token) {
            if (stale) {
                const token = req.query.token   // Token para teste: 'ab52e4a2a6ebd5462c96a1872402c3b1'
                await refreshCurrencies(token)
            }
            res.status(302)
            res.setHeader('Location', linkUrl(req, '/currencies', {}))
            res.setHeader('Cache-Control', 'no-cache, no-store, private')
            return res.end()
        }
        res.json({
            age,
            stale,
            layer: app.config.currencylayer,
            _links: {
                root: {href: linkUrl(req, '/', {})},
            }
        })
    }

    return { root, currencies }
}
