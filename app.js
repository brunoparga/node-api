require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');

const multer = require('./middleware/multer');
const setHeaders = require('./middleware/set-headers');
const errorHandler = require('./middleware/error-handler');
const schema = require('./graphql/schema');
const rootValue = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());
app.use(multer);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(setHeaders);
app.use('/graphql', graphqlHTTP({ schema, rootValue, graphiql: true }));
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(8080));
