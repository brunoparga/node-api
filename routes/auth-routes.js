const router = require('express').Router();
const controller = require('../controllers/auth-controller');

const validate = require('../middleware/validator').user;
const isAuth = require('../middleware/is-auth');

router.post('/signup', validate, controller.signup);
router.post('/login', controller.login);
router.get('/status', isAuth, controller.getStatus);
router.put('/status', isAuth, controller.setStatus);

module.exports = router;
