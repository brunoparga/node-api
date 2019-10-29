const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');

const validate = (input) => {
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
    const error = new Error('Invalid input: ');
    error.data = errors;
    error.code = 422;
    throw error;
  }
};

module.exports = {
  async createUser({ userInput }) {
    validate(userInput);
    const { email, password, name } = userInput;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User exists already.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({ email, name, password: hashedPassword }).save();
    return { ...user._doc, _id: user._id.toString() };
  },
};
