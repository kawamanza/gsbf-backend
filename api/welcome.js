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
    return { root }
}
