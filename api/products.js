module.exports = app => {
    function entrypoint(req, res) {
        res.json({
            title: "Products Entrypoint",
            _links: {
                parent: {href: [req.protocol, "://", req.headers.host, '/'].join('')},
                self:  {href: [req.protocol, "://", req.headers.host, '/products'].join('')},
            }
        })
    }
    return { entrypoint }
}
