const express = require('express');
const {body} = require('express-validator');

const User = require('../models/User');
const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/signup',
    body('email').isEmail()
        .withMessage('Please enter a valid email address')
        .custom((value, {req}) => {
            return User.findOne({where: {email: value}})
                .then(user => {
                    if (user) {
                        return Promise.reject('Email already exists');
                    }
                })
        }),
    body('password')
        .isLength({min: 5})
        .trim(),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name cannot be empty')
    , authController.signup)

router.post('/login', authController.login)

router.get('/status', isAuth, authController.status)
router.put('/status', isAuth, authController.updateStatus)

module.exports = router;
