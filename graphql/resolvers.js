require('dotenv').config();
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const throwError = (status, message, data = []) => {
  const error = new Error(message);
  error.statusCode = status;
  error.data = data;
  throw error;
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

module.exports = {
  async createUser({ userInput }) {
    validateSignup(userInput);
    const { email, password, name } = userInput;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User exists already.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({ email, name, password: hashedPassword }).save();
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
};
