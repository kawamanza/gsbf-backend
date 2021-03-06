const qs = require("querystring")

module.exports = app => {
    const CURRENCIES = ['BRL', 'USD', 'EUR', 'INR']
    const Product = app.mongoose.model('Product', {
        title: {type: String, required: [true, 'Title required']},
        price: {type: Number, required: [true, 'Price required'], min: [0.01, 'Price invalid']},
        promo_price: {type: Number, min: [0.01, 'Promo Price invalid']},
        currency: {type: String, required: [true, 'Currency required'], enum: CURRENCIES},
    }, 'products')


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

    function priceCurrencies({currency, price, promo_price}) {
        const prices = {
            [currency]: { price, promo_price }
        }
        const defaultQuote = app.config.currencylayer.quotes['USD' + currency]
        for (let curr of CURRENCIES) {
            if (curr !== currency) {
                const quote = app.config.currencylayer.quotes['USD' + curr]
                prices[curr] = {
                    price: Math.round(price / defaultQuote * quote * 100) / 100
                }
                if (promo_price) {
                    prices[curr].promo_price = Math.round(promo_price / defaultQuote * quote * 100) / 100
                }
            }
        }
        return prices
    }

    function productListResponse(product) {
        const req = this
        const {_id: id, title} = product._doc
        return {
            id,
            title,
            prices: priceCurrencies(product._doc),
            _links: {
                product: {href: [req.protocol, "://", req.headers.host, '/products/', product._id].join('')}
            }
        }
    }

    async function list(req, res) {
        const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 10), 50)
        const page = Math.max(0, parseInt(req.query.page) || 0)
        const title = new RegExp((req.query.q || '.*'))
        const all = await Product.find({ title }).limit(limit + 1).skip(page * limit)
        res.json({
            title: "Products",
            ...resourceInfo(req, '/products', {limit, page, next: all.length > limit}),
            objects: all.slice(0, 10).map(productListResponse.bind(req)),
        })
    }

    async function create(req, res) {
        const product = new Product(req.body)
        try {
            await product.validate()
            await product.save()
            res.status(201)
            res.json({ok: true})
        } catch(e) {
            res.status(422)
            res.json(e)
        }
    }

    async function detail(req, res) {
        const product = await Product.findOne({_id: req.params.id})
        res.json({
            id: product.id,
            ...product._doc,
            _id: void(0),
            __v: void(0),
            ...resourceInfo(req, '/products/'+product.id, {parent: true}),
            _meta: {
                prices: {
                    ...priceCurrencies(product._doc),
                    [product.currency]: void(0),
                },
            }
        })
    }

    function entrypoint(req, res) {
        if (Object.keys(req.query).length) {
            list(req, res)
        } else {
            res.json({
                title: 'Products Entrypoint',
                ...resourceInfo(req, '/products', {}),
            })
        }
    }
    return { entrypoint, create, detail }
}
