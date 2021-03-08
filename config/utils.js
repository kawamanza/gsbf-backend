const axios = require('axios')
const fs = require('fs')
const path = require('path')
const qs = require("querystring")

module.exports = app => {
    function linkUrl(req, path, query) {
        const queryString = (Object.keys(query).length ? "?" + qs.stringify(query) : "")
        return [req.protocol, "://", req.headers.host, path, queryString].join('')
    }

    function resourceInfo(req, path, {next, limit, page, parent}) {
        const query = {...req.query, limit, page}
        const queryString = (Object.keys(req.query).length ? "?" + qs.stringify(query) : "")
        
        return ({
            _links: {
                root: {href: [req.protocol, "://", req.headers.host, '/'].join('')},
                entrypoint: queryString ? {href: linkUrl(req, path, {})} : void(0),
                parent: parent ?  {href: linkUrl(req, path.replace(/\/[^\/]+$/, ''), {})} : void(0),
                self:  {href: [req.protocol, "://", req.headers.host, path, queryString].join('')},
                next: next ? {href: linkUrl(req, path, {...query, page: query.page + 1})} : void(0),
                prev: page > 0 ? {href: linkUrl(req, path, {...query, page: query.page - 1})} : void(0),
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

    return { linkUrl, resourceInfo, refreshCurrencies }
}
