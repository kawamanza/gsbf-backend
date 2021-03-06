module.exports = app => {
    app.get('/', app.api.welcome.root)
    app.get('/products', app.api.products.entrypoint)
    app.get('/products/:id', app.api.products.detail)
    app.post('/products', app.api.products.create)
}
