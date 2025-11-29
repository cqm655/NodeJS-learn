// ============================
// 📦 Importuri de bază
// ============================
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

// ============================
// ⚙️ Configurare Express app
// ============================
const app = express();

// ============================
// 🗄️ Configurare conexiune PostgreSQL pentru sesiuni
// ============================
const pgPool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1111',
    database: 'NodeJS',
});

// ============================
// 🧱 Configurare view engine și directoare
// ============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================
// 🧩 Middleware-uri de bază
// ============================
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(multer({ if we want to store in a folder locally
//     dest: path.join(__dirname, 'images')
// }).single('image'));
const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, 'images'));
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString().replace(/[:.]/g, '-') + ' - ' + file.originalname);
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false)

    }
}
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

// ============================
// 💾 Configurare sesiune cu stocare în PostgreSQL
// ============================
app.use(session({
    store: new pgSession({
        pool: pgPool,
        tableName: 'sessions',
        createTableIfMissing: true, // opțional, creează tabela dacă lipsește
    }),
    secret: 'my secret', // 🔐 schimbă în producție!
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 60 * 1000, // 1h * 60 = 60h (atenție la valoare)
    },
}));

// ============================
// 🔒 Protecție CSRF + Flash messages
// ============================
const csrfProtection = csrf();
app.use(csrfProtection);
app.use(flash());

// ============================
// 🧠 Modele Sequelize și relații
// ============================
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const OrderItem = require('./models/order-item');
const Order = require('./models/order');

// ============================
// 🔗 Rute
// ============================
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

// ============================
// 👤 Middleware pentru atașarea utilizatorului Sequelize la req
// ============================
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
        .then(user => {
            if (!user) return next();
            req.user = user; // ✅ User real Sequelize cu metode (getCart, createProduct etc.)
            next();
        })
        .catch(err => {
            // trimitem eroarea mai departe la handler-ul global
            next(new Error(err));
        });
});

// ============================
// 🧭 Middleware global pentru variabilele folosite în view-uri
// ============================
// (disponibile în toate EJS-urile)
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// ============================
// 🚏 Rute principale
// ============================
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// ============================
// 🚨 Handler global pentru erori
// ============================
app.get('/500', (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session?.isLoggedIn
    });
});
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.redirect('/500');
});

// ============================
// 🧱 Pagină 404
// ============================
app.use(errorController.get404);

// ============================
// 🧩 Definirea relațiilor Sequelize
// ============================
// User ↔ Product
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

// User ↔ Cart
User.hasOne(Cart);
Cart.belongsTo(User);

// Cart ↔ Product (prin CartItem)
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

// User ↔ Order
Order.belongsTo(User);
User.hasMany(Order);

// Order ↔ Product (prin OrderItem)
Order.belongsToMany(Product, {through: OrderItem});

// ============================
// 🚀 Pornirea aplicației și sincronizarea DB
// ============================
sequelize
    //.sync({ force: true }) // 💣 doar la dezvoltare — recreează tabelele
    .sync()
    .then(() => {
        // Creează utilizatorul implicit, dacă lipsește
        return User.findOne().then(user => {
            if (!user) {
                return User.create({
                    email: 'admin@example.com',
                    password: 'test'
                });
            }
            return user;
        });
    })
    .then(user => {
        // Creează coșul implicit al utilizatorului
        return user.getCart().then(cart => {
            if (!cart) {
                return user.createCart();
            }
            return cart;
        });
    })
    .then(() => {
        console.log('✅ Database sync OK — server running on port 3000');
        app.listen(3000);
    })
    .catch(err => console.error('❌ Startup error:', err));
