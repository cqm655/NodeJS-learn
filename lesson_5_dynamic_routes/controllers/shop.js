const Product = require("../models/product");
const Cart = require("../models/cart");
exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        })
    })
}
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        res.render('shop/product-detail', {
            product,
            pageTitle: product.title,
            path: '/products',
        })
    })
}
exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
        })
    })
}
exports.getCart = (req, res, next) => {
    Cart.getProducts(cart => {
        Product.fetchAll((products) => {
            const cartProducts = []
            for (product of products) {
                product
                const cartProductData = cart.products.find((item) => item.id === product.id)
                if (cartProductData) {
                    cartProducts.push({productData: product, quantity: cartProductData.quantity});
                }
            }
            res.render('shop/cart', {
                products: cartProducts,
                path: '/cart',
                pageTitle: 'Your Cart',
            })
        })
    })
}
exports.postCart = (req, res, next) => {
    const prodId = req.body.id
    Product.findById(prodId, product => {
        Cart.addProduct(prodId, product.price)
        res.redirect('/cart')
    })
}
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.id
    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, product.price)
        res.redirect('/cart')
    })
    console.log(prodId)
}
exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
    })
}
exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    })
}