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
    constructor(title, imageUrl, description, price) {
        this.title = title,
            this.imageUrl = imageUrl,
            this.description = description,
            this.price = price
    }

    static fetchAll(callback) {
        getProductsFromFile(callback)
    }

    static findById(id, callback) { //we run a qury when find a id
        getProductsFromFile(products => {
            const product = products.find(item => item.id.toString() === id);
            callback(product);
        })

    }

    save() {
        this.id = new Date().getTime().toString();
        getProductsFromFile(products => {
            products.push(this)
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err)
            })
        })
    }
}