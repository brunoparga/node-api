require('dotenv').config();
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const authController = require('../controllers/auth-controller');

describe('Auth controller - login', function testLogin() {
  before(function setupDB(done) {
    mongoose.connect(process.env.MONGODB_URI_TEST,
      { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => User.deleteMany({}))
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
      .then(() => mongoose.disconnect())
      .then(() => done());
  });

  it('should throw a 500 error if accessing the database fails',
    function throwsIfDBFails(done) {
      sinon.stub(User, 'findOne');
      User.findOne.throws();
      const req = {
        body: {
          email: 'test@test.com',
          password: 'Testy McTestface',
        },
      };
      // expect(authController.login).to.throw();
      authController.login(req, {}, () => { })
        .then((result) => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 500);
          done();
        });
      User.findOne.restore();
    });

  it('should send a response with a valid user status for an existing user',
    function returnsUserStatus(done) {
      const req = { userId: '5c0f66b979af55031b34728a' };
      const res = {
        statusCode: 500,
        userId: null,
        status: function status(code) {
          this.statusCode = code;
          return this;
        },
        json: function json(data) {
          this.userStatus = data.status;
        },
      };
      authController.getStatus(req, res, () => { })
        .then(() => {
          expect(res.statusCode).to.equal(200);
          expect(res.userStatus).to.equal('I am born. I am new.');
          done();
        });
    });
});
