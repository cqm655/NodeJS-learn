const express = require('express')
const path = require('path')

const bodyParser = require('body-parser')

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Absolute path to the views folder


const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");

app.use(bodyParser.urlencoded({extended: false})) //middleware function, calls next in end
app.use(express.static(path.join(__dirname, 'public'))) // a folder for read acces

app.use('/admin', adminRoutes) //we can add a common pattern for all routes, all other paths will begin with it, /admin/add-product etc

app.use(shopRoutes)

app.use(errorController.get404)

// app.get('/product', (req, res) => {}) only for GET request
// app.post('/product', (req, res) => {}) only for Post request


app.listen(3000)