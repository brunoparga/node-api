require('dotenv').config();
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Post = require('../models/post');

const throwError = (status, message, data = []) => {
  const error = new Error(message);
  error.statusCode = status;
  error.data = data;
  throw error;
};

const validateAuth = (req) => {
  if (!req.isAuth) {
    throwError(401, 'User not authenticated.');
  }
};

const validateSignup = (input) => {
  const { email, password, name } = input;
  const errors = [];
  if (!validator.isEmail(email)) {
    errors.push({ message: 'Invalid email address.' });
  }
  if (!validator.isLength(password, { min: 5 })) {
    errors.push({ message: 'Password must be at least 5 characters long.' });
  }
  if (validator.isEmpty(name)) {
    errors.push({ message: 'Name must be provided.' });
  }
  if (errors.length > 0) {
    throwError(422, 'Invalid input', errors);
  }
};

const validateLogin = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throwError(401, 'User not found.');
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throwError(401, 'Incorrect password.');
  }
  return user;
};

const validatePost = ({ title, content, imageURL }) => {
  const errors = [];
  if (!validator.isLength(title, { min: 5 })) {
    errors.push('Title must be 5 characters long.');
  }
  if (!validator.isLength(content, { min: 5 })) {
    errors.push('Content must be 5 characters long.');
  }
  if (!validator.isURL(imageURL)) {
    errors.push('Image URL must be valid.');
  }
  if (errors.length > 0) {
    throwError(422, 'Invalid input', errors);
  }
};

const preparePost = (post) => ({
  ...post._doc,
  _id: post._id.toString(),
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
});

module.exports = {
  async createUser({ userInput }) {
    validateSignup(userInput);
    const { email, name } = userInput;
    let { password } = userInput;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User exists already.');
    }
    password = await bcrypt.hash(password, 12);
    const user = await new User({ email, name, password }).save();
    return { ...user._doc, _id: user._id.toString() };
  },

  async login(input) {
    const user = await validateLogin(input);
    const userId = user._id.toString();
    const token = jwt.sign({
      userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' });
    return { token, userId };
  },

  async createPost({ postInput }, req) {
    validateAuth(req);
    validatePost(postInput);
    const { title, content, imageURL } = postInput;
    const creator = await User.findById(req.userId);
    if (!creator) {
      throwError(401, 'Invalid user.');
    }
    const post = await new Post({
      title, content, imageURL, creator,
    }).save();
    creator.posts.push(post);
    await creator.save();
    return preparePost(post);
  },

  async posts(_args, req) {
    validateAuth(req);
    const currentPage = req.query.page || 1;
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    let posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate('creator');
    posts = posts.map(preparePost);
    return { posts, totalPosts };
  },
};
