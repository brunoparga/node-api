const router = require('express').Router();
const controller = require('../controllers/feed-controller');

const validator = require('../middleware/validator');

// GET /feed/posts
router.get('/posts', controller.getPosts);

// POST /feed/post
router.post('/post', validator, controller.handleErrors, controller.createPost);

module.exports = router;
