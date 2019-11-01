require('dotenv').config();
const { expect } = require('chai');
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');
const feedController = require('../controllers/feed-controller');

describe('Feed controller - createPost', function testCreatePost() {
  before(function setupDB(done) {
    mongoose.connect(process.env.MONGODB_URI_TEST,
      { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => User.deleteMany({}))
      .then(() => Post.deleteMany({}))
      .then(() => {
        const user = new User({
          _id: '5c0f66b979af55031b34728a',
          name: 'Testy McTestface',
          email: 'test@test.com',
          password: 'correct horse battery staple',
          posts: [],
        });
        user.save();
      })
      .then(() => done());
  });

  after(function cleanupDB(done) {
    User.deleteMany({})
      .then(() => Post.deleteMany({}))
      .then(() => mongoose.disconnect())
      .then(() => done());
  });

  it('should add a post to the creating user\'s post list',
    function addsPostToCreatorsList(done) {
      const req = {
        body: {
          title: 'A Tale of Two Tests',
          content: 'It was the mock of times, it was the stub of times.',
        },
        file: {
          path: 'images/duck.jpg',
        },
        userId: '5c0f66b979af55031b34728a',
      };
      const res = { status() { return this; }, json() { } };

      feedController.createPost(req, res, () => { })
        .then((user) => {
          expect(user).to.have.property('posts');
          expect(user.posts).to.have.length(1);
          done();
        });
    });
});
