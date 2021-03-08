
module.exports = app => {
    const CURRENCIES = ['BRL', 'USD', 'EUR', 'INR']
    const Product = app.mongoose.model('Product', {
        title: {type: String, required: [true, 'Title required'], unique: true},
        price: {type: Number, required: [true, 'Price required'], min: [0.01, 'Price invalid']},
        promo_price: {type: Number, min: [0.01, 'Promo Price invalid']},
        currency: {type: String, required: [true, 'Currency required'], enum: CURRENCIES},
    }, 'products')

    const { linkUrl, resourceInfo } = app.config.utils

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
        const {_id: id, title, currency, price, promo_price} = product._doc
        return {
            id, title,
            currency, price, promo_price,
            _links: {
                product: {href: linkUrl(req, '/products/'+product._id, {})}
            },
            _meta: {
                prices: {
                    ...priceCurrencies(product._doc),
                    [currency]: void(0),    // suprimindo atributo
                },
            },
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

    function resourceDetail(req, product) {
        return {
            id: product.id,
            ...product._doc,
            _id: void(0),   // suprimindo atributo
            __v: void(0),   // suprimindo atributo
            ...resourceInfo(req, '/products/'+product.id, {parent: true}),
            _meta: {
                prices: {
                    ...priceCurrencies(product._doc),
                    [product.currency]: void(0),    // suprimindo atributo
                },
            }
        }
    }

    async function detail(req, res) {
        const product = await Product.findOne({_id: req.params.id})
        res.json(resourceDetail(req, product))
    }

    async function update(req, res) {
        try {
            await new Product(req.body).validate()
            const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true})
            res.json(resourceDetail(req, product))
        } catch(e) {
            res.status(422)
            res.json(e)
        }
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
    return { entrypoint, create, detail, update }
}
