const qs = require("querystring")

module.exports = app => {
    const Product = app.mongoose.model('Product', {
        title: {type: String, required: [true, 'Title required']},
        price: {type: Number, required: [true, 'Price required'], min: [0.01, 'Price invalid']},
        promo_price: {type: Number, min: [0.01, 'Promo Price invalid']},
        currency: {type: String, required: [true, 'Currency required'], enum: ['BRL', 'USD', 'EUR', 'INR']},
    }, 'products')

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

    function entrypoint(req, res) {
        if (Object.keys(req.query).length) {
            list(req, res)
        } else {
            res.json(resourceInfo(req))
        }
    }
    return { entrypoint, create }
}
