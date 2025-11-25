const Product = require("../models/product");
const Order = require("../models/order");
const fs = require('fs');
const path = require("path");
const PDFDocument = require("pdfkit");

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

const ITEMS_PER_PAGE = 10;

exports.getIndex = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1; // if false we will use 1
        const limit = parseInt(req.query.limit) || 2;
        const offset = (page - 1) * limit;

        const {count, rows} = await Product.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
        });

        const totalPages = Math.ceil(count / limit);

        res.render('shop/index', {
            products: rows,
            currentPage: page,
            hasNextPage: limit * page < count,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: totalPages,
            pageTitle: 'Shop',
            path: '/',
        });

    } catch (err) {
        console.error(err);
        return next(err);
    }
};

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
    const prodId = req.body.id;
    let fetchedCart;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: prodId}});
        })
        .then(products => {
            let product = products[0];
            let newQuantity = 1;

            if (product) {
                newQuantity = product.cartItem.quantity + 1;
                return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
            }

            return Product.findByPk(prodId)
                .then(product => {
                    return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
                });
        })
        .then(() => res.redirect('/cart'))
        .catch(err => next(err));
};

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
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findByPk(orderId, {include: ['products']}).then((order) => {
        if (!order) {
            return next(new Error('No Order'));
        }
        if (order.UserId.toString() !== req.user.id.toString()) {
            return next(new Error('You are not logged in'));
        }
        const invoiceName = 'Invoice-' + orderId + '.pdf'
        const invoicePath = path.join(__dirname, '..', 'invoices', invoiceName)

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice PDF', {
            underline: true
        });

        pdfDoc.text('------------------------------')

        let total = 0;

        order.products.forEach(prod => {
            const line = `${prod.title} - ${prod.orderItem.quantity} x ${prod.price}`;
            total += prod.orderItem.quantity * prod.price;
            pdfDoc.fontSize(14).text(line);
        });

        pdfDoc.text('----------------------------------------');
        pdfDoc.fontSize(20).text('Total: ' + total + ' MDL');

        pdfDoc.end();

    }).catch(err => {
        next(new Error(err));
    })

}
