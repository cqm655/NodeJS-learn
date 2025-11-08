const express = require('express')
const {check, body} = require("express-validator");

const router = express.Router()

const isAuth = require('../middleware/isAuth')

const adminController = require('../controllers/admin')

router.get('/add-product', isAuth, adminController.getAddProducts)

router.post('/add-product', [
        body('title').isString().isLength({min: 3}).trim(),
        body('imageUrl').isURL(),
        body('price').isFloat(),
        body('description').isLength({min: 5, max: 200}).trim(),
    ],

    isAuth
    , adminController.postAddProduct)

router.get('/products', isAuth, adminController.getProducts)

router.get('/edit-product/:productId', isAuth, adminController.getEditProducts)

router.post('/edit-product', [
    body('title').isString().isLength({min: 3}).trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({min: 5, max: 200}).trim(),
], isAuth, adminController.postEditProduct)

router.post('/delete-product', isAuth, adminController.deleteProduct)

module.exports = router;