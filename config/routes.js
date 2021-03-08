module.exports = app => {
    app.get('/', app.api.welcome.root)
    app.get('/products', app.api.products.entrypoint)
    app.get('/currencies', app.api.welcome.currencies)
    app.get('/products/:id', app.api.products.detail)
    app.put('/products/:id', app.api.products.update)
    app.post('/products', app.api.products.create)
}
