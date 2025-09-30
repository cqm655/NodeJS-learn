const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json')

module.exports = class Cart {
    static addProduct(id, productPrice) {
        //fetch previous cart
        fs.readFile(p, (err, data) => {
            let cart = {products: [], totalPrice: 0};
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
            cart.totalPrice = cart.totalPrice + productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err)
            })
        })

    }

}