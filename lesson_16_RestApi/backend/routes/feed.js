const express = require('express');
const {body} = require('express-validator');

const feedController = require('../controllers/feed');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post(
    '/post',
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().isLength({min: 5}).withMessage('Content must be at least 5 characters')
    ],
    feedController.createPost
);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId', [
    body('title').isString().isLength({min: 5}).trim(),
    body("content").isString().isLength({min: 5}).trim()
], feedController.updatePost);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;

