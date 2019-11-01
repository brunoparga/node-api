const { expect } = require('chai');
const sinon = require('sinon');

const User = require('../models/user');
const authController = require('../controllers/auth-controller');

describe('Auth controller - login', function testLogin() {
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
      authController.login(req, {}, () => {})
        .then((result) => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 500);
          done();
        });
      User.findOne.restore();
    });
});
