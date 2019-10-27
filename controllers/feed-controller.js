const { validationResult } = require('express-validator');
const Post = require('../models/post');

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

exports.createPost = (req, res) => {
  new Post({
    // This weird line picks out only the title and content from the body.
    ...(({ title, content }) => ({ title, content }))(req.body),
    imageURL: 'images/duck.jpg',
    creator: { name: 'Sblerbous M. Bananistan' },
  }).save()
    .then((post) => {
      res.status(201).json({ message: 'Post created successfully!', post });
    });
};
