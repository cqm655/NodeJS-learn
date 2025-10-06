const Cart = require('./Cart');
const db = require('../util/database');

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    static async fetchAll() {

        try {
            const result = await db.query('SELECT * FROM products');
            console.log(result.rows);
            return result.rows;
        } catch (err) {
            console.log(err)
        }

    }

    static async findById(id) { //we run a qury when find a id
        try {
            const result = await db.query(`SELECT *
                                           FROM products
                                           WHERE id = $1`, [id]);
            return result.rows;
        } catch (err) {
            console.log(err)
        }
    }

    static deleteProduct(id) {

    }

    async save() {
        try {
            const product = await db.query(
                'INSERT INTO products(title, imageurl, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
                [this.title, this.imageUrl, this.description, this.price]
            );
            return product.rows[0];

        } catch (err) {
            console.log(err)
        }
    }
}