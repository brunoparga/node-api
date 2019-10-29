require('dotenv').config();
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const forwardError = (err, next) => {
  const newErr = err;
  if (!newErr.statusCode) {
    newErr.statusCode = 500;
  }
  next(newErr);
};

const handleErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Could not create user due to errors.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
};

const checkUser = (user) => {
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
};

const checkPassword = (match) => {
  if (!match) {
    const error = new Error('Wrong password.');
    error.statusCode = 401;
    throw error;
  }
};

const createToken = (user) => {
  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  return token;
};

exports.signup = async (req, res, next) => {
  handleErrors(req);
  const { name, email } = req.body;
  try {
    const password = await bcrypt.hash(req.body.password, 12);
    const user = await new User({ name, email, password }).save();
    res.status(201).json({ message: 'User created.', userId: user._id });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const maybeUser = await User.findOne({ email });
    checkUser(maybeUser);
    const user = maybeUser;
    const match = await bcrypt.compare(password, user.password);
    checkPassword(match);
    const token = createToken(user);
    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ status: user.status });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    user.status = req.body.status;
    await user.save();
    res.status(200).json({ message: 'Your new status has been set.' });
  } catch (err) {
    forwardError(err, next);
  }
};
