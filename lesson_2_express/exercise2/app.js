const express = require('express')
const bodyParser = require('body-parser')
const usersRoute = require('./routes/users');
const mainRoute = require('./routes/main');
const path = require("path");

const app = express()

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static(path.join(__dirname, 'public')))

app.use(usersRoute)
app.use(mainRoute)


app.listen(3001)