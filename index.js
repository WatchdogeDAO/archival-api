const express = require('express');
const dotenv = require('dotenv');
var cors = require('cors');
const { runBot } = require('./bot');
const { listArchive } = require('./storage');

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());

app.get('/videos', async (req, res) => {
  const archive = await listArchive();
  res.json(archive);
});

app.listen(port, () =>
  console.log(`Archival API listening at http://localhost:${port}`)
);

runBot();
