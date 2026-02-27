const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');

// =========== GraphQL
const {graphqlHTTP} = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

// =========== postgres session
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
// ==========

// ========   database Models
const User = require('./models/user');
const Post = require('./models/post');

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
// to resolve graphql method not allowed
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next(); //need to call next to continue.
}) //allow cord, methods

//====== GraphQL =======
app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    formatError(err) {
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occurred';
        const code = err.originalError.code || 500;
        return {message: message, code: code, data: data};
    }
}))

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

app.listen(8080);
