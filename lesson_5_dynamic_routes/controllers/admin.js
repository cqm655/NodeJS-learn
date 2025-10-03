const Product = require("../models/product");

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(null, title, imageUrl, description, price);
    product.save()
    res.redirect('/');
}

exports.getEditProducts = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        })
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updateTitle = req.body.title;
    const updateDescription = req.body.description;
    const updatePrice = req.body.price;
    const updateImageUrl = req.body.imageUrl;
    const updatedProduct = new Product(prodId, updateTitle, updateImageUrl, updateDescription, updatePrice);
    updatedProduct.save()
    res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        })
    })
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.id
    Product.deleteProduct(prodId)
    res.redirect('/admin/products');
}

