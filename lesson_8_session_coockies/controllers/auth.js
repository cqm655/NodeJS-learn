exports.getLogin = (req, res, next) => {
    console.log(req.get('Cookie').split(';')[5].trim().split('=')[1].trim())
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login'
    })
}
exports.postLogin = (req, res, next) => {
    res.setHeader('Set-Cookie', `loggedIn=true`)
    res.redirect('/')
}


