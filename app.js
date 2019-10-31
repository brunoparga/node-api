require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');

const multer = require('./middleware/multer');
const setHeaders = require('./middleware/set-headers');
const errorHandler = require('./middleware/error-handler');
const auth = require('./middleware/auth');
const schema = require('./graphql/schema');
const rootValue = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());
app.use(multer);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(setHeaders);
app.use(auth);
app.put('/post-image', (req, res) => {
  if (!req.isAuth) {
    throw new Error('User not authenticated.');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided.' });
  }
  if (req.body.oldPath) {
    fs.unlink(path.join(__dirname, '..', req.body.oldPath), () => { });
  }
  return res.status(201).json({
    message: 'File stored.',
    imageURL: req.file.path,
  });
});
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue,
  graphiql: true,
  customFormatErrorFn(err) {
    if (!err.originalError) {
      return err;
    }
    const message = err.message || 'An error occurred.';
    const code = err.originalError.code || 500;
    const { data } = err.originalError;
    return { message, code, data };
  },
}));
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(8080));
