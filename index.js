const express = require('express');
const dotenv = require('dotenv');
var cors = require('cors');
const { runBot } = require('./src/bot');
const { getTweets } = require('./src/db');

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());

app.get('/tweets', async (req, res) => {
  const tweets = getTweets();
  res.json(tweets);
});

runBot();

app.listen(port, () =>
  console.log(`Archival API listening at http://localhost:${port}`)
);
