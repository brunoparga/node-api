const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const socket = require('../socket');

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

const checkPost = (post, req = false) => {
  if (!post) {
    throwError(404, 'Post not found.');
  }
  if (req && post.creator._id.toString() !== req.userId) {
    throwError(403, 'Cannot change other user\'s post.', []);
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

const dealWithImage = (post, req) => {
  const imageURL = setImageURL(req);
  // Delete old post image if there is a new one
  if (imageURL !== post.imageURL) {
    fs.unlink(path.join(__dirname, '..', post.imageURL), () => { });
  }
  const newPost = post;
  newPost.imageURL = imageURL;
  return newPost;
};

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate('creator');
    res.status(200).json({ posts, totalItems });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate('creator');
    checkPost(post);
    res.status(200).json({ post });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.handleCreateErrors = (req, _res, next) => handleErrors(req, next);

exports.handleUpdateErrors = (req, _res, next) => handleErrors(req, next, true);

exports.createPost = async (req, res, next) => {
  const post = new Post({
    // This weird line picks out only the title and content from the body.
    ...(({ title, content }) => ({ title, content }))(req.body),
    imageURL: req.file.path,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    const savedUser = await user.save();
    const creator = (({ _id, name }) => ({ _id, name }))(user);
    socket.getIO().emit('posts', {
      action: 'create',
      post: {
        ...post._doc,
        creator: {
          _id: user._id,
          name: user.name,
        },
      },
    });
    res.status(201).json({ post, creator });
    return savedUser;
  } catch (err) {
    return forwardError(err, next);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.postId).populate('creator');
    checkPost(post, req);
    ['title', 'content'].forEach((prop) => {
      post[prop] = req.body[prop];
    });
    post = dealWithImage(post, req);
    await post.save();
    socket.getIO().emit('posts', { action: 'update', post });
    res.status(200).json({ post });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    checkPost(post, req);
    fs.unlink(path.join(__dirname, '..', post.imageURL), () => { });
    await post.remove();
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    socket.getIO().emit('posts', { action: 'delete', postId })
    res.status(200).json({ message: `Post ${postId} deleted.` });
  } catch (err) {
    forwardError(err, next);
  }
};
