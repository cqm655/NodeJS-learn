const {validationResult} = require('express-validator')

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            title: 'Post 1',
            _id: 1,
            content: 'Lorem ipsum',
            createdAt: new Date(),
            creator: {name: "Iurii"},
            imageUrl: 'images/duck.jpg'
        }]
    });
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;

    const post = new Post({
        title, content, imageUrl: "images/duck.jpg", creator: {
            name: 'Iurii'
        },
    });
//create a post in DB
    post.save().then((result) => {
        res.status(201).json({
            message: 'Post created successfully',
            post: result
        });
    }).catch(err => console.log(err))

}

