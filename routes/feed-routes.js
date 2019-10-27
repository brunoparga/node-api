const router = require('express').Router();
const controller = require('../controllers/feed-controller');

const validator = require('../middleware/validator');

router.get('/posts', controller.getPosts);
router.get('/post/:postId', controller.getPost);
router.post('/post', validator, controller.handleErrors, controller.createPost);

module.exports = router;
