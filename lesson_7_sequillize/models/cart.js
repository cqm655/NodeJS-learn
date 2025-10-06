const fs = require('fs');
const path = require('path');
const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'cart.json'
);
module.exports = class Cart {
    static addProduct(id, productPrice) {
        //fetch previous cart
        fs.readFile(p, (err, data) => {
            let cart = {products: [], totalPrice: 0};
            console.log(cart)
            if (!err) {
                cart = JSON.parse(data)
            }
            // find existing product
            const existingProductIndex = cart.products.findIndex((product) => product.id === id);
            const existingProduct = cart.products[existingProductIndex]
            let updatedProduct;
            //add new product
            if (existingProduct) {
                updatedProduct = {...existingProduct};
                updatedProduct.quantity = existingProduct.quantity + 1;
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct
            } else {
                updatedProduct = {id: id, quantity: 1}
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err)
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, data) => {
            if (err) {
                return console.log(err);
            }
            const updateCart = {...JSON.parse(data)}
            const product = updateCart.products.find((product) => product.id === id);
            if (!product) {
                return;
            }
            const productQty = product.quantity;
            updateCart.products = updateCart.products.filter((product) => product.id !== id);
            updateCart.totalPrice = updateCart.totalPrice - productPrice * productQty
            fs.writeFile(p, JSON.stringify(updateCart), (err) => {
                console.log(err)
            })
        })
    }

    static getProducts(callback) {
        fs.readFile(p, (err, data) => {
            const cart = JSON.parse(data)
            if (err) {
                callback(null)
            } else {
                callback(cart)
            }
        })
    }
}