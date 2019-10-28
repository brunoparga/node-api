const router = require('express').Router();
const controller = require('../controllers/feed-controller');

const validator = require('../middleware/validator');

router.get('/posts', controller.getPosts);
router.get('/post/:postId', controller.getPost);
router.post(
  '/post',
  validator,
  controller.handleCreateErrors,
  controller.createPost,
);
router.put(
  '/post/:postId',
  validator,
  controller.handleUpdateErrors,
  controller.updatePost,
);
router.delete('/post/:postId', controller.deletePost);

module.exports = router;
