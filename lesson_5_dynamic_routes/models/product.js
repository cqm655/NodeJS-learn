const fs = require('fs');
const path = require('path');
const Cart = require('./Cart');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'products.json'
);

const getProductsFromFile = callback => {
    fs.readFile(p, (err, data) => {
        if (err) {
            return callback([]); // dacă fișierul nu există
        }
        try {
            const fileContent = data.toString().trim();
            if (!fileContent) {
                return callback([]); // dacă fișierul e gol
            }
            callback(JSON.parse(fileContent));
        } catch (e) {
            console.log("Eroare la parsarea JSON:", e);
            callback([]);
        }
    });
};


module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.title = title,
            this.id = id,
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

    static deleteProduct(id) {
        getProductsFromFile(products => {
            const product = products.find(item => item.id.toString() === id);
            const updatedProducts = products.filter(item => item.id.toString() !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            })
        })
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(item => item.id === this.id)
                const updatedProducts = [...products]
                updatedProducts[
                    existingProductIndex
                    ] = this
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err)
                })
            } else {

                this.id = new Date().getTime().toString();
                products.push(this)
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err)
                })
            }
        })
    }
}