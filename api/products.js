const qs = require("querystring")

module.exports = app => {

    function resourceInfo(req) {
        const query = (Object.keys(req.query).length ? "?" : "") + qs.stringify(req.query)
        return ({
            title: "Products Entrypoint",
            _links: {
                parent: {href: [req.protocol, "://", req.headers.host, '/'].join('')},
                self:  {href: [req.protocol, "://", req.headers.host, '/products', query].join('')},
            }
        })
    }

    async function list(req, res) {
        const all = []
        res.json({
            ...resourceInfo(req),
            title: "Products",
            objects: all,
        })
    }

    function entrypoint(req, res) {
        if (Object.keys(req.query).length) {
            list(req, res)
        } else {
            res.json(resourceInfo(req))
        }
    }
    return { entrypoint }
}
