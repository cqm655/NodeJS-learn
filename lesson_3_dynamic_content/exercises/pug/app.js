const express = require('express')
const path = require('path')

const bodyParser = require('body-parser')

const app = express();

app.set('view engine', 'pug') // mandatory to work with templates
app.set('views', path.join(__dirname, 'views'))

const adminData = require("./routes/admin");

const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({extended: false})) //middleware function, calls next in end
app.use(express.static(path.join(__dirname, 'public'))) // a folder for read acces

app.use('/admin', adminData.routes) //we can add a common pattern for all routes, all other paths will begin with it, /admin/add-product etc

app.use(shopRoutes)

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(3000)