const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports = {
  async createUser({ userInput }) {
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
