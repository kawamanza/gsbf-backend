module.exports = app => {
    app.get('/', app.api.welcome.root)
}
