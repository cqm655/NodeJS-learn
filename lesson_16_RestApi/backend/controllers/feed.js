const {validationResult} = require('express-validator')
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {

    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post.findAndCountAll()
        .then(count => {
            totalItems = count;
            return Post.findAll()
        })

        .then(posts => {
            res.status(200).json({posts: posts});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

const clearImage = filePath => {
    const clearImage = filePath => {
        filePath = path.join(__dirname, '..', filePath);

        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.log(err);
        }
    };
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('File is required');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = 'images/' + req.file.filename;

    const post = new Post({
        title, content, imageUrl: imageUrl, creator: {
            name: 'Iurii'
        },
    });
//create a post in DB
    post.save().then((result) => {
        res.status(201).json({
            message: 'Post created successfully',
            post: result
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })

}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findByPk(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Not Found!');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                post: post,
                message: 'Post found successfully' //optional
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}
exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = 'images/' + req.file.filename;
    }
    if (!imageUrl) {
        const error = new Error('Not Found!');
        error.statusCode = 422;
        throw error;
    }

    Post.findByPk(postId)
        .then(post => {

            if (!post) {
                const error = new Error('Not Found!');
                error.statusCode = 404;
                throw error;
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save()
        })
        .then(result => {
            res.status(200).json({message: "Post Updated successfully", post: result});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    const postToDestroy = Post.findByPk(postId)
        .then(async post => {
            if (!post) {
                const error = new Error('Not Found!');
                error.statusCode = 404;
                throw error;
            }
            //check logged in user
            clearImage(post.imageUrl);
            return await Post.destroy({where: {id: postId}}).then(() => {

                res.status(200).json({message: "Post Deleted successfully"});
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}
