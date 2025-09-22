const express = require('express')

const app = express();

app.use('/', (req, res, next) => {
    console.log('first log')
    next()
})

app.use('/users', (req, res, next) => {
    res.send('<h1>Hello from users page</h1>')
})

app.listen(3000)