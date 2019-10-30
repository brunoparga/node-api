require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
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
