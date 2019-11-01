const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const isAuth = require('../middleware/auth');

describe('The authentication middleware', function testAuthMiddleware() {
  it('should throw an error when no authorization header is set',
    function throwsWithoutHeader() {
      const req = {
        get() {
          return null;
        },
      };
      expect(isAuth.bind(this, req, {}, () => { })).to.throw('Not authenticated.');
    });

  it('should throw an error if the authorization header cannot be split',
    function throwsWithUnsplittableHeader() {
      const req = {
        get() {
          return 'Authenticated!';
        },
      };
      expect(isAuth.bind(this, req, {}, () => { })).to.throw();
    });

  it('should throw an error if the JSON Web Token cannot be verified',
    function throwWithUnverifiedToken() {
      const req = {
        get() {
          return 'Bearer Most-Excellent-JWT-Token';
        },
      };
      expect(isAuth.bind(this, req, {}, () => { })).to.throw();
    });

  it('should give the request a userId property after decoding the token',
    function worksCorrectly() {
      const req = {
        get() {
          return 'Bearer Most-Excellent-JWT-Token';
        },
      };
      sinon.stub(jwt, 'verify');
      jwt.verify.returns({ userId: 'TestUser' });
      isAuth(req, {}, () => { });
      expect(req).to.have.property('userId', 'TestUser');
      expect(jwt.verify.called).to.be.true;
      jwt.verify.restore();
    });
});
