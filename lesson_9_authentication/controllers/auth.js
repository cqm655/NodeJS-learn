const User = require("../models/user");
const bcrypt = require("bcryptjs");

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
exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;

    User.findOne({where: {email}})
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }

            return bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    return res.redirect('/login');
                }

                req.session.user = user;
                req.session.isLoggedIn = true;

                return user.getCart().then(cart => {
                    if (!cart) {
                        return user.createCart();
                    }
                    return cart;
                }).then(() => {
                    req.session.save(err => {
                        if (err) console.log(err);
                        res.redirect('/');
                    });
                });
            });
        })
        .catch(err => console.log(err));
};

exports.postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({where: {email: email}}).then(userDoc => {
        if (userDoc) {
            return res.redirect('/signup');
        }
        return bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
            })
            return user.save()
        });

    }).then(result =>
        res.redirect('/login')).catch((err) => {
        console.log(err)
    })

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


