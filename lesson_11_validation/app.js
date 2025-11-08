const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session')
const app = express();
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const pgPool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1111',
    database: 'NodeJS',
})

const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new pgSession({
        pool: pgPool,
        tableName: 'sessions',
        createTableIfMissing: true,
    }),
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 60 * 1000,
    }
}))

//after creating session add csrf

app.use(csrfProtection)

//after we can use it everywere

app.use(flash())

const sequelize = require('./util/database');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const OrderItem = require('./models/order-item');
const Order = require('./models/order');

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
        .then(user => {
            if (!user) return next();
            req.user = user; // user Sequelize real, cu metode getCart etc.
            next();
        })
        .catch(err => console.log(err));
});
//send csrf token for every view and request
//use locals cauze are used only in views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User)
Cart.belongsToMany(Product, {through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, {through: OrderItem})

sequelize
    //.sync({force: true})
    .sync()
    .then(() => {
        return User.findOne();
    })
    .then(user => {
        if (!user) {
            // dacă nu există, creează un user implicit
            return User.create({
                email: 'admin@example.com',
                password: 'test'
            });
        }
        return user;
    })
    .then(user => {
        return user.getCart().then(cart => {
            if (!cart) {
                return user.createCart();
            }
            return cart;
        });
    })
    .then(() => {
        console.log('Database ok');
        app.listen(3000);
    })
    .catch(err => console.log(err));



