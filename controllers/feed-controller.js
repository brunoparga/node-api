const { validationResult } = require('express-validator');

exports.getPosts = (_req, res) => {
  res.status(200).json({
    posts: [{
      _id: 1,
      title: 'Hello world',
      content: 'Content is overrated, fite me',
      imageURL: 'images/duck.jpg',
      creator: {
        name: 'Bananistan',
      },
      createdAt: new Date(),
    }],
  });
};

exports.createPost = (req, res) => {
  const { title, content } = req.body;
  // Create post in DB
  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: 'Bananistan',
      },
      createdAt: new Date(),
    },
  });
};

exports.processErrors = (req, res, next) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    res.status(422).json({
      message: 'Your Post could not be created due to errors.',
      errors,
    });
  } else {
    next();
  }
};
