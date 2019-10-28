const fs = require('fs');
const path = require('path');
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

const handleErrors = (req, _res, next, update = false) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    throwError(422,
      `Your Post could not be ${update ? 'updated' : 'created'} due to errors.`);
  }
  if (!update && !req.file) {
    throwError(422, 'No image provided.');
  }
  next();
};

exports.handleCreateErrors = (req, res, next) => handleErrors(req, res, next);

exports.handleUpdateErrors = (req, res, next) => handleErrors(req, res, next, true);


exports.createPost = (req, res, next) => new Post({
  // This weird line picks out only the title and content from the body.
  ...(({ title, content }) => ({ title, content }))(req.body),
  imageURL: req.file.path,
  creator: { name: 'Sblerbous M. Bananistan' },
}).save()
  .then((post) => res.status(201).json({ post }))
  .catch((err) => forwardError(err, next));


const setImageURL = (req) => {
  let imageURL = req.body.image;
  if (req.file) {
    imageURL = req.file.path;
  }
  if (!imageURL) {
    throwError(422, 'Something went wrong with the updated post image.');
  }
  return imageURL;
};

exports.updatePost = (req, res, next) => {
  const imageURL = setImageURL(req);
  Post.findById(req.params.postId)
    .then((post) => {
      if (!post) {
        throwError(404, 'Could not find post.');
      }
      const newPost = post;
      ['title', 'content'].forEach((prop) => { newPost[prop] = req.body[prop]; });
      newPost.imageURL = imageURL;
      if (imageURL !== post.imageURL) {
        fs.unlink(path.join(__dirname, '..', post.imageURL));
      }
      return newPost.save();
    })
    .then((post) => res.status(200).json({ post }))
    .catch((err) => forwardError(err, next));
};
