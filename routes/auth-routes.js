const router = require('express').Router();
const controller = require('../controllers/auth-controller');

router.post('/signup', controller.signup);

module.exports = router;
