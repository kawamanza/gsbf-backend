module.exports = app => {
    function root(req, res) {
        res.json({
            title: "GSBF API",
            version: "1.0.0",
            _links: {
                self: {href: [req.protocol, "://", req.headers.host, '/'].join('')},
            }
        })
    }
    return { root }
}
