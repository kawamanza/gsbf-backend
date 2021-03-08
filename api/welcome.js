module.exports = app => {
    const { linkUrl, refreshCurrencies } = app.config.utils

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
