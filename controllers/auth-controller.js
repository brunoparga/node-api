const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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

exports.signup = (req, res, next) => {
  handleErrors(req);
  const { name, email } = req.body;
  bcrypt.hash(req.body.password, 12)
    .then((password) => new User({ name, email, password }).save())
    .then((user) => res.status(201)
      .json({ message: 'User created.', userId: user._id }))
    .catch((err) => forwardError(err, next));
};
