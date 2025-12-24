const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
// =========== postgres session
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
// ==========

// ========   database Models
const User = require('./models/user');
const Post = require('./models/post');

// ======== Define Routes
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

// ===== create PostgreSQL conection
const pgPool = new pg.Pool({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: '1111',
    database: 'NodeJSV2',
});

//==========

const app = express();

// Cors policy
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next(); //need to call next to continue.
}) //allow cord, methods

//config filestorage with multer
const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, 'images'));
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString().replace(/:/g, '-') + ' - ' + file.originalname);
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

app.use(express.json());
app.use(bodyParser.json()); //application/json

// use multer before routes !!!
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));
// ============================
// Configure session for PostgreSQL
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
// 🧠 Modele Sequelize și relații
// ============================
const sequelize = require('./utils/database');

// ======  Databse Relations
Post.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Post);

sequelize.sync({force: false})
    .then(() => {
        console.log('Tables dropped and recreated!');
    });

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode;
    const message = error.message;
    const data = error.data;

    res.status(statusCode).json({message: message, data: data});
})

const server = app.listen(8080);
const io = require('./socket').init(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Authorization'],
        credentials: false
    }
});

//  ====== we gain socket as an info of new client, connection established
io.on('connection', (socket) => {
    console.log('Client connected', socket.id);
})
