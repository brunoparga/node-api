const router = require('express').Router();
const controller = require('../controllers/feed-controller');

const validate = require('../middleware/validator').post;

router.get('/posts', controller.getPosts);
router.get('/post/:postId', controller.getPost);
router.post(
  '/post',
  validate,
  controller.handleCreateErrors,
  controller.createPost,
);
router.put(
  '/post/:postId',
  validate,
  controller.handleUpdateErrors,
  controller.updatePost,
);
router.delete('/post/:postId', controller.deletePost);

module.exports = router;
