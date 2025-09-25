const express = require('express')
const router = express.Router()

const getUsers = require('./main')

router.get('/users', (req, res) => {
    res.render('users', {userName: getUsers.users})
})

exports.routes = router;