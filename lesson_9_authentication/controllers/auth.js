const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    if (req.session.user) {
        console.log('User found in session:', req.session.user.id);
        return res.redirect('/');
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isAuthenticated
    });
}
exports.postLogin = async (req, res, next) => {
    const {email, password} = req.body

    console.log('body', req.body)
    try {
        const isUser = await User.findOne({where: {email: email}});

        if (!isUser) {
            return res.redirect('/login');
        }

        req.session.user = isUser;
        req.session.isLoggedIn = true;

        req.session.save((err) => {
            if (err) {
                console.log(err)
            }

            res.redirect('/')
        })

    } catch (error) {
        console.log(error);
        res.redirect('/login');
    }

}

exports.postSignup = async (req, res, next) => {
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    })
}

exports.postLogout = async (req, res, next) => {

    req.session.destroy((err) => {
        console.log(err)
        res.clearCookie('connect.sid');
        return res.redirect('/')
    })
}


