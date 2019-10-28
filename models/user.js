const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'I am born. I am new.',
  },
  posts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
  },
},
{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
