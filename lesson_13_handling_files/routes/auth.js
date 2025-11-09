const express = require('express')
const {check, body} = require("express-validator");
const authController = require('../controllers/auth')
const router = express.Router()
const User = require("../models/User")

router.get('/login', authController.getLogin)
router.post('/login', [

    check('email')
        .isEmail()
        .withMessage('Incorrect email address')
        .trim(),
    body('password')
        .isLength({min: 5, max: 50})
        .withMessage('Password must be at least 5 characters')
        .isAlphanumeric()
        .trim()

], authController.postLogin)
router.post('/logout', authController.postLogout)
router.get('/signup', authController.getSignup)
router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Enter a valid E-mail')
        .trim()
        .custom((value, {req}) => {
            // if (value === 'test@test.com') {
            //     throw new Error('E-mail address is forbiden.')
            // }
            // return true;
            return User.findOne({where: {email: value}})
                .then((user) => {
                    if (user) {
                        return Promise.reject('E-mail already exists!')
                    }
                })
        }),
    body('password',
        'Plaease enter a password with only number and text and at least 5 characters')
        .isLength({min: 5, max: 50})
        .trim()
        .isAlphanumeric(),
    body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords don`t match!')
            }
            return true;
        })
], authController.postSignup)
router.get('/reset', authController.getResetPassword)
router.post('/reset', authController.postResetPassword)
router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)

module.exports = router
