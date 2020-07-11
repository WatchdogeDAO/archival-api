const fs = require('fs');
const fleekStorage = require('@fleekhq/fleek-storage-js');
const dotenv = require('dotenv');
const { runBot } = require('./bot');

dotenv.config();

const fileName = 'sample.mp4';
const filePath = `data/${fileName}`;

const upload = filePath => {
  fs.readFile(filePath, async (error, fileData) => {
    const uploadedFile = await fleekStorage.upload({
      apiKey: process.env.FLEEK_API_KEY,
      apiSecret: process.env.FLEEK_API_SECRET,
      key: fileName,
      data: fileData,
    });
  });
};

const listFiles = async () => {
  const files = await fleekStorage.listFiles({
    apiKey: process.env.FLEEK_API_KEY,
    apiSecret: process.env.FLEEK_API_SECRET,
    getOptions: ['bucket', 'key', 'hash', 'publicUrl'],
  });
  console.log(files);
};

runBot();
