const express = require('express')

const router = express.Router()

const products = []

router.get('/add-product', (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add Product', path: '/admin/add-product',
        formCSS: true,
        productCSS: true,
        activeAddProduct: true
    })
})

router.post('/add-product', (req, res, next) => {
    products.push({title: req.body.title, description: req.body.description})
    res.redirect('/');
})

exports.routes = router;
exports.products = products;