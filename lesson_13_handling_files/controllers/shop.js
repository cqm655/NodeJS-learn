const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
    Product.findAll().then((rows, fieldData) => {
        res.render('shop/product-list', {
            products: rows,
            pageTitle: 'All Products',
            path: '/products',
        })
    }).catch(err => {
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)

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
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
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
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    })
}
exports.getCart = (req, res, next) => {
    req.user.getCart().then(cart => {
        return cart.getProducts().then(products => {
            res.render('shop/cart', {
                products: products,
                path: '/cart',
                pageTitle: 'Your Cart',
            })
        }).catch(err => console.log(err));
    }).catch(err => {
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    })
}
exports.postCart = (req, res, next) => {
    const prodId = req.body.id
    let fetchedCart;
    req.user.getCart().then((cart) => {
        fetchedCart = cart;
        return cart.getProducts({where: {id: prodId}}).then((products) => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            let newQuantity = 1;
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return fetchedCart.addProduct(product, {
                    through: {quantity: newQuantity},
                })
            }
            return Product.findByPk(prodId).then((product) => {
                return fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
            })
                .catch(err => {
                    const error = new Error(err.message);
                    err.httpStatus = 500;
                    return next(error)
                });
        })
    }).catch(err => console.log(err));
    Product.findByPk(prodId).then(product => {
        console.log('product', product)
        product.save()
        res.redirect('/cart')
    }).catch(err => {
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    });
}
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.id
    req.user.getCart().then((cart) => {
        return cart.getProducts({where: {id: prodId}})
    }).then(products => {
        const product = products[0];
        return product.cartItem.destroy()
    }).then((result) => {
        res.redirect('/cart')
    }).catch(err => {
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    });

}
exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']}).then((orders) => {

        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders
        })
    }).catch(err => {
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    });
}
exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    })
}

exports.postOrder = (req, res, next) => {
    let fetchCart;
    req.user.getCart().then((cart) => {
        fetchCart = cart;
        return cart.getProducts()
    }).then(products => {
        return req.user.createOrder().then(order => {
            return order.addProducts(products.map(product => {
                product.orderItem = {quantity: product.cartItem.quantity};
                return product
            }))
        }).catch(err => {
            const error = new Error(err.message);
            err.httpStatus = 500;
            return next(error)
        });
    }).then(result => {
        return fetchCart.setProducts(null)

    }).then(() => {
        res.redirect('/orders')
    })
        .catch(err => {
            const error = new Error(err.message);
            err.httpStatus = 500;
            return next(error)
        });
}
