const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'products.json'
);

const getProductsFromFile = callback => {


    fs.readFile(p, (err, data) => {
        if (err) {
            return callback([])
        }
        callback(JSON.parse(data))
    })
}

module.exports = class Product {
    constructor(t) {
        this.title = t
    }

    static fetchAll(callback) {
        getProductsFromFile(callback)
    }

    save() {
        getProductsFromFile(products => {
            products.push(this)
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err)
            })
        })
    }
}