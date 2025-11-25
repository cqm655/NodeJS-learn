const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('NodeJS', 'postgres', '1111', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false, // sau console.log pentru a vedea query-urile
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test conexiune
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

module.exports = sequelize;