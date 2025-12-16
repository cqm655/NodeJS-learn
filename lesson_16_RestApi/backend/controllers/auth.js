const User = require('../models/user')
const {validationResult} = require('express-validator');
const bcrypt = require("bcryptjs")

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
