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
    return { linkUrl, resourceInfo }
}
