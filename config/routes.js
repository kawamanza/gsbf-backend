module.exports = app => {
    app.get('/', app.api.welcome.root)
    app.get('/products', app.api.products.entrypoint)
}
