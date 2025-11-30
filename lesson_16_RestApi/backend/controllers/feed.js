exports.getPosts = (req, res, next) => {
    res.status(200).json({post: [{title: 'Post 1', content: 'Lorem ipsum'}]});
}

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    console.log(title);
    res.status(201).json({
        message: 'Post created successfully.',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    })
}