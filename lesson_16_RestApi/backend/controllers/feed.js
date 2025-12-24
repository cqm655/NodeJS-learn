const {validationResult} = require('express-validator');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');

// =====================
// Helper
// =====================
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    try {
        fs.unlinkSync(filePath);
    } catch (err) {
        console.log(err);
    }
};

// =====================
// GET POSTS (pagination)
// =====================
exports.getPosts = async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;

    try {
        const {rows, count} = await Post.findAndCountAll({
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
            include: [{model: User, attributes: ['name']}]
        });

        res.status(200).json({
            posts: rows,
            totalItems: count
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// CREATE POST
// =====================
exports.createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            throw error;
        }

        if (!req.file) {
            const error = new Error('Image is required.');
            error.statusCode = 422;
            throw error;
        }

        const post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            imageUrl: 'images/' + req.file.filename,
            userId: req.userId
        });

        const populatedPost = await post.reload({
            include: [{model: User, attributes: ['name']}]
        });

        res.status(201).json({
            message: 'Post created successfully',
            post: populatedPost
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// GET SINGLE POST
// =====================
exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.postId, {
            include: [{model: User, attributes: ['name']}]
        });

        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({post});
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// UPDATE POST
// =====================
exports.updatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            throw error;
        }

        const post = await Post.findByPk(req.params.postId);
        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = 404;
            throw error;
        }

        if (post.userId !== req.userId) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }

        let imageUrl = post.imageUrl;
        if (req.file) {
            clearImage(post.imageUrl);
            imageUrl = 'images/' + req.file.filename;
        }

        post.title = req.body.title;
        post.content = req.body.content;
        post.imageUrl = imageUrl;

        const updatedPost = await post.save();

        res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// DELETE POST
// =====================
exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.postId);

        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = 404;
            throw error;
        }

        if (post.userId !== req.userId) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);
        await post.destroy();

        res.status(200).json({message: 'Post deleted successfully'});
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};
