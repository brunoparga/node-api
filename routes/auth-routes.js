const router = require('express').Router();
const controller = require('../controllers/auth-controller');

const validate = require('../middleware/validator').user;

router.post('/signup', validate, controller.signup);
router.post('/login', controller.login);

module.exports = router;
