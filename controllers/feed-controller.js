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

const throwError = (status, message, data) => {
  const error = new Error(message);
  error.statusCode = status;
  error.data = data;
  throw error;
};

const check404 = (post) => {
  if (!post) {
    throwError(404, 'Post not found.');
  }
};

// TODO: refactor this and the auth controller's function into just one
const handleErrors = (req, next, update = false) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError(
      422,
      `Your Post could not be ${update ? 'updated' : 'created'} due to errors.`,
      errors.array(),
    );
  }
  if (!update && !req.file) {
    throwError(422, 'No image provided.', errors.array());
  }
  next();
};

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

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find().countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => res.status(200).json({ posts, totalItems }))
    .catch((err) => forwardError(err, next));
};

exports.getPost = (req, res, next) => Post
  .findById(req.params.postId)
  .then((post) => {
    check404(post);
    res.status(200).json({ post });
  })
  .catch((err) => forwardError(err, next));

exports.handleCreateErrors = (req, _res, next) => handleErrors(req, next);

exports.handleUpdateErrors = (req, _res, next) => handleErrors(req, next, true);

exports.createPost = (req, res, next) => new Post({
  // This weird line picks out only the title and content from the body.
  ...(({ title, content }) => ({ title, content }))(req.body),
  imageURL: req.file.path,
  creator: { name: 'Sblerbous M. Bananistan' },
}).save()
  .then((post) => res.status(201).json({ post }))
  .catch((err) => forwardError(err, next));

exports.updatePost = (req, res, next) => {
  const imageURL = setImageURL(req);
  Post.findById(req.params.postId)
    .then((post) => {
      check404(post);
      const newPost = post;
      ['title', 'content'].forEach((prop) => { newPost[prop] = req.body[prop]; });
      newPost.imageURL = imageURL;
      if (imageURL !== post.imageURL) {
        fs.unlink(path.join(__dirname, '..', post.imageURL), () => {});
      }
      return newPost.save();
    })
    .then((post) => res.status(200).json({ post }))
    .catch((err) => forwardError(err, next));
};

exports.deletePost = (req, res, next) => {
  Post.findById(req.params.postId)
    .then((post) => {
      check404(post);
      // TODO: check logged in user
      fs.unlink(path.join(__dirname, '..', post.imageURL), () => {});
      return post.remove();
    })
    .then((post) => res.status(200).json({ post }))
    .catch((err) => forwardError(err, next));
};
