const express = require('express')

const router = express.Router()

const isAuth = require('../middleware/isAuth')

const adminController = require('../controllers/admin')

router.get('/add-product', isAuth, adminController.getAddProducts)

router.post('/add-product', isAuth, adminController.postAddProduct)

router.get('/products', isAuth, adminController.getProducts)

router.get('/edit-product/:productId', isAuth, adminController.getEditProducts)

router.post('/edit-product', isAuth, adminController.postEditProduct)

router.post('/delete-product', isAuth, adminController.deleteProduct)

module.exports = router;