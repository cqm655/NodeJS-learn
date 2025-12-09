const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
// =========== postgres session
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
// ==========
const feedRoutes = require('./routes/feed');

// ===== create PostgreSQL conection
const pgPool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1111',
    database: 'NodeJS',
});

//==========

const app = express();

app.use(express.json());
app.use(bodyParser.json()); //application/json
app.use("/images", express.static(path.join(__dirname, 'images')));
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
const Post = require('./models/post');
sequelize.sync({force: false})
    .then(() => {
        console.log('Tables dropped and recreated!');
    });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next(); //need to call next to continue.
}) //allow cord, methods

app.use('/feed', feedRoutes);

app.listen(8080);