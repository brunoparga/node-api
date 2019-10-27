const { validationResult } = require('express-validator');
const Post = require('../models/post');

const forwardError = (err, next) => {
  const newErr = err;
  if (!newErr.statusCode) {
    newErr.statusCode = 500;
  }
  next(newErr);
};

const throwError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
};

exports.getPosts = (_req, res, next) => Post.find()
  .then((posts) => res.status(200).json({ posts }))
  .catch((err) => forwardError(err, next));

exports.getPost = (req, res, next) => Post
  .findById(req.params.postId)
  .then((post) => {
    if (!post) {
      throwError(404, 'Post not found.');
    }
    res.status(200).json({ post });
  })
  .catch((err) => forwardError(err, next));

exports.handleErrors = (req, _res, next) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    throwError(422, 'Your Post could not be created due to errors.');
  }
  next();
};

exports.createPost = (req, res, next) => new Post({
  // This weird line picks out only the title and content from the body.
  ...(({ title, content }) => ({ title, content }))(req.body),
  imageURL: 'images/duck.jpg',
  creator: { name: 'Sblerbous M. Bananistan' },
}).save()
  .then((post) => res.status(201).json({ post }))
  .catch((err) => forwardError(err, next));
