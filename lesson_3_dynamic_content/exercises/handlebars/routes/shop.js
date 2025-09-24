const express = require('express')

const router = express.Router()

const adminData = require("./admin");

router.get('/', (req, res, next) => {
    console.log(adminData.products);
    const products = adminData.products;
    res.render('shop', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeAddProduct: true,
        productCSS: true
    })
})

module.exports = router