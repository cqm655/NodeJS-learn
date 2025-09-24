const express = require('express')

const router = express.Router()

const users = []

router.get('/', (req, res, next) => {
    res.render('main', {title: 'Who are you?', users: users})
})

router.post('/', (req, res, next) => {
    const person = req.body.name
    users.push(person)
    res.redirect('/users')
})

exports.routes = router;
exports.users = users;