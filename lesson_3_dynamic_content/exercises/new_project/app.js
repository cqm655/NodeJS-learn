const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const homeRoute = require('./routes/main');
const userRoute = require('./routes/users');

app.set('view engine', 'ejs')
app.set('views', 'views')

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: false}));

app.use(homeRoute.routes)
app.use(userRoute.routes)

app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Not Found'})
})

app.listen(3000)