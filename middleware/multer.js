const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images'),
  filename: (req, file, cb) => cb(null,
    `${new Date().toISOString()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => cb(null,
  ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype));

module.exports = multer({ storage, fileFilter }).single('image');
