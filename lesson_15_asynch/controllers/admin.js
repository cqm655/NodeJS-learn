const Product = require("../models/product");
const {validationResult} = require("express-validator");
const path = require('path');

const fileHelper = require("../util/file");

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
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req);

    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: 'Attached file is not an image!',
            validationErrors: [],
            product: {
                title: title,
                price: price,
                description: description
            },
        })
    }

    const imageUrl = path.join('images', image.filename).replace(/\\/g, '/');

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
        })
    }
    req.user.createProduct({
        title,
        imageUrl,
        description,
        price
        // ,id: "ca737177-621d-4fe9-a830-2cc92db88625" // to check error
    }).then(result => {
        res.redirect('/products')
        console.log('Product added')
    }).catch((err) => {
        //     return res.status(500).render('admin/edit-product', {
        //         pageTitle: 'Add Product',
        //         path: '/admin/add-product',
        //         editing: false,
        //         hasError: true,
        //         errorMessage: 'Database operation error',
        //         validationErrors: errors.array(),
        //         product: {
        //             title: title,
        //             imageUrl: imageUrl,
        //             price: price,
        //             description: description,
        //         },
        //     })
        // res.redirect('/500')
        const error = new Error(err.message);
        error.httpStatus = 500;
        return next(error)
    })
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
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updateTitle = req.body.title;
    const updateDescription = req.body.description;
    const updatePrice = req.body.price;
    const image = req.file;
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

        if (image) {
            // delete old image
            fileHelper.deleteFile(product.imageUrl);

            // set new image
            const imageUrl = path.join('images', image.filename).replace(/\\/g, '/');
            product.imageUrl = imageUrl;
        }

        return product.save().then(() => {

            console.log('Update successfull!')
            res.redirect('/admin/products');
        })
    })
        .catch(err => {
            const error = new Error(err.message);
            err.httpStatus = 500;
            return next(error)
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
        const error = new Error(err.message);
        err.httpStatus = 500;
        return next(error)
    })
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.id
    Product.findByPk(prodId).then(product => {
        if (!product) {
            return next(new Error('Product not found!'));
        }
        fileHelper.deleteFile(product.imageUrl)

        return Product.destroy({where: {id: prodId, UserId: req.user.id}})

    }).then(() => {
        console.log('Delete successfull!')
        // res.redirect('/admin/products');
        res.status(200).json({message: "Successfully deleted!"});
    }).catch(err => {
        res.status(500).json("Deleting product failed!");
    })

}

