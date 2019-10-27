require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const setHeaders = require('./middleware/set-headers');
const feedRoutes = require('./routes/feed-routes');

const app = express();

app.use(bodyParser.json());
app.use(setHeaders);
app.use('/feed', feedRoutes);

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(8080));
