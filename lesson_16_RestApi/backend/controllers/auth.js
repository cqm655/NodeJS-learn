const User = require('../models/user')
const {validationResult} = require('express-validator');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {

    const errors = validationResult(req);
    // ==== if we got errors
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    console.log(email);

    bcrypt.hash(password, 10).then(hashedPassword => {
        const user = new User({email, name, password: hashedPassword});
        return user.save();
    }).then(result => {
        console.log("User Created: ", result)
        res.json({message: 'User created successfully', user: result.id})
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    console.log("login", email, password);
    User.findOne({where: {email: email}})
        .then(user => {
            if (!user) {
                const error = new Error('Invalid email');
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            //return because will give a promise
            return bcrypt.compare(password, user.password);
        })
        .then(doMatch => {
            if (!doMatch) {
                const error = new Error('Invalid password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser.id
            }, process.env.JWT_SECRET, {expiresIn: '1h'});

            res.stats(200).json({token: token, userId: loadedUser.id.toString(), message: 'Logged in successfully'})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}
