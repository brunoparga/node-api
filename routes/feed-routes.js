const router = require('express').Router();
const controller = require('../controllers/feed-controller');

const validate = require('../middleware/validator').post;
const isAuth = require('../middleware/is-auth');

router.get('/posts', isAuth, controller.getPosts);
router.get('/post/:postId', isAuth, controller.getPost);
router.post(
  '/post',
  isAuth,
  validate,
  controller.handleCreateErrors,
  controller.createPost,
);
router.put(
  '/post/:postId',
  isAuth,
  validate,
  controller.handleUpdateErrors,
  controller.updatePost,
);
router.delete('/post/:postId', controller.deletePost);

module.exports = router;
