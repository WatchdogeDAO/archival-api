const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
var bodyParser = require('body-parser');
var cors = require('cors');
const { runBot } = require('./src/bot');
const { getTweets, getTweet } = require('./src/db');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('healthy');
});

app.get('/tweets', async (req, res) => {
  const tweets = getTweets();
  res.json(tweets);
});

app.get('/tweets/:hash', (req, res) => {
  const tweet = getTweet(req.params.hash);
  res.json(tweet);
});

app.post('/pin', async (req, res) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  try {
    const response = await axios({
      method: 'post',
      url: url,
      data: req.body.data,
      headers: {
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
    });
    res.json(response.data);
  } catch (e) {
    res.status(500).send(e);
  }
});

runBot();

app.listen(port, () => console.log(`Archival API listening in port ${port}`));
