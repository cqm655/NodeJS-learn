const pg = require('pg')
const {Pool} = pg
const pool = new Pool({
    user: 'postgres',
    password: '1111',
    host: 'localhost',
    port: 5432,
    database: 'NodeJS',
})
// pool.query('SELECT NOW()')
//     .then(res => console.log(res.rows[0]))
//     .catch(err => console.error('DB error:', err));

module.exports = pool
