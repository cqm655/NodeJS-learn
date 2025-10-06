const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
    Product.findAll().then((rows, fieldData) => {
        res.render('shop/product-list', {
            products: rows,
            pageTitle: 'All Products',
            path: '/products',
        })
    }).catch(err => {
        console.log(err)

    })
}
exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findAll({where: {id: productId}}).then((rows) => {
        res.render('shop/product-detail', {
            product: rows[0],
            pageTitle: rows[0].title,
            path: '/products',
        })
    }).catch(err => {
        console.log(err)
    })

}
exports.getIndex = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/index', {
            products: products,
            pageTitle: 'Shop',
            path: '/',
        })
    }).catch((err) => {
        console.log(err)
    })
}
exports.getCart = (req, res, next) => {
    Cart.getProducts(cart => {
        Product.findAll((products) => {
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