const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require('dotenv').config();
const crypto = require("crypto");
const {Op} = require("sequelize");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth',
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    }
});

exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
    });
}
exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;

    User.findOne({where: {email}})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password!');
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
            req.flash('error', 'Email already exists!');
            return res.redirect('/signup');
        }
        return bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
            })
            return user.save()
        });

    }).then(result => {
        console.log(result.email)
        res.redirect('/login')
        return transporter.sendMail({
            from: "leneshul@gmail.com",
            to: result.email,
            subject: "New User Authentication",
            html: "<h1>You succesfully signed up!</h1>",
        })

    })

        .catch((err) => {
            console.log(err)
        })

}

exports.getSignup = (req, res, next) => {

    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
    })
}

exports.postLogout = async (req, res, next) => {

    req.session.destroy((err) => {
        console.log(err)
        res.clearCookie('connect.sid');
        return res.redirect('/')
    })
}

exports.getResetPassword = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
    })
}

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(16, (err, buf) => {
        if (err) {
            console.log(err)
            return res.redirect('/')
        }
        const token = buf.toString('hex');
        User.findOne({where: {email: req.body.email}}).then(
            user => {

                if (!user) {
                    req.flash('error', 'Invalid email !!!')
                    res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpires = Date.now() + 60 * 60 * 1000;
                return user.save()
            }
        ).then(result => {
            res.redirect('/');
            return transporter.sendMail({
                from: "leneshul@gmail.com",
                to: req.body.email,
                subject: "Password Reset",
                html: `
                <p> Password reset !!! </p>
                <p> <a href="http://localhost:3000/reset/${token}">Click This link to set a new Password</a> </p>
                `,
            })
        })
            .catch(err => console.log(err));
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: {[Op.gt]: Date.now()},

        }
    })
        .then((user) => {
            if (!user) {
                req.flash("error", "Token invalid or expired!");
                return res.redirect("/reset");
            }

            let message = req.flash("error");
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }

            res.render("auth/new-password", {
                path: "/new-password",
                pageTitle: "Set New Password",
                errorMessage: message,
                userId: user.id.toString(),   // Sequelize folosește `id`, nu `_id`
                passwordToken: token,
            });
        })
        .catch(err => console.log(err));
}

exports.postNewPassword = async (req, res, next) => {
    const {password: newPassword, userId, passwordToken} = req.body;

    try {
        const user = await User.findOne({
            where: {
                id: userId,
                resetToken: passwordToken,
                resetTokenExpires: {[Op.gt]: Date.now()}
            }
        });

        if (!user) {
            req.flash("error", "Token invalid or expired!");
            return res.redirect("/reset");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;

        await user.save();

        res.redirect("/login");
    } catch (err) {
        console.log(err);
        res.redirect("/reset");
    }
};


