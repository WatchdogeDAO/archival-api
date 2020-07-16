const axios = require('axios');
const fs = require('fs');
const fleekStorage = require('@fleekhq/fleek-storage-js');

const fileName = 'sample.mp4';

async function downloadVideo(url) {
  const path = fileName;
  const writer = fs.createWriteStream(path);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

const uploadFromUrl = async url => {
  try {
    await downloadVideo(url);
  } catch (e) {
    console.log("Couldn't download video.", e);
  }

  try {
    const data = fs.readFileSync(fileName);
    const uploadedFile = await fleekStorage.upload({
      apiKey: process.env.FLEEK_API_KEY,
      apiSecret: process.env.FLEEK_API_SECRET,
      key: fileName,
      data: data,
    });
    return uploadedFile.hash;
  } catch (e) {
    throw new Error('Failed pinning file.');
  }
};

const getFileName = url => url.slice(-27, -7);

const listArchive = async () => {
  const archive = await fleekStorage.listFiles({
    apiKey: process.env.FLEEK_API_KEY,
    apiSecret: process.env.FLEEK_API_SECRET,
    getOptions: ['bucket', 'key', 'hash', 'publicUrl'],
  });
  return archive;
};

module.exports = {
  uploadFromUrl,
  listArchive,
};
