const { body } = require('express-validator');
const User = require('../models/user');

exports.user = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((email) => User.findOne({ email })
      .then((user) => {
        if (user) {
          Promise.reject(new Error('Email already exists.'));
        }
      }))
    .normalizeEmail(),
  body('password').trim().isLength({ min: 5 }),
  body('name').trim().not().isEmpty(),
];

exports.post = [
  body('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long.'),
  body('content')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Content must be at least 5 characters long.'),
];
