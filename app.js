const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed-routes');

const app = express();

app.use(bodyParser.json());
app.use('/feed', feedRoutes);

app.listen(8080);
