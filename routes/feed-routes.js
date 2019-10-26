const router = require('express').Router();
const controller = require('../controllers/feed-controller');

// GET /feed/posts
router.get('/posts', controller.getPosts);

module.exports = router;
