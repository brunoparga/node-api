require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const multer = require('./middleware/multer');
const setHeaders = require('./middleware/set-headers');
const authRoutes = require('./routes/auth-routes');
const feedRoutes = require('./routes/feed-routes');
const errorHandler = require('./middleware/error-handler');
const socketIO = require('./socket');

const app = express();

app.use(bodyParser.json());
app.use(multer);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(setHeaders);
app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => socketIO.init(app.listen(8080)));
