const Product = require("../models/product");
const {validationResult} = require("express-validator");

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description,
            },
        })
    }
    req.user.createProduct({
        title,
        imageUrl,
        description,
        price,
    }).then(result => {
        console.log('Product added')
    }).catch((err) => {
        console.log(err)
    })
    res.redirect('/');
}

exports.getEditProducts = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    req.user.getProducts({where: {id: prodId}})
        .then(products => {
            const product = products[0];
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            })
        }).catch(err => {
        console.log(err)
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updateTitle = req.body.title;
    const updateDescription = req.body.description;
    const updatePrice = req.body.price;
    const updateImageUrl = req.body.imageUrl;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                title: updateTitle,
                imageUrl: updateImageUrl,
                price: updatePrice,
                description: updateDescription,
                id: prodId,
            },
        })
    }

    Product.findByPk(prodId).then(product => {
        if (product.UserId !== req.user.id) {
            return res.redirect('/')
        }
        product.title = updateTitle;
        product.description = updateDescription;
        product.price = updatePrice;
        product.imageUrl = updateImageUrl;
        return product.save().then(() => {

            console.log('Update successfull!')
            res.redirect('/admin/products');
        })
    })
        .catch(err => {
            console.log(err)
        })
}

exports.getProducts = (req, res, next) => {

    Product.findAll({
        where: {UserId: req.user.id}
    }).then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
            validationErrors: null,
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.id
    Product.destroy({where: {id: prodId, UserId: req.user.id}})
    res.redirect('/admin/products');
}

