const axios = require('axios');
const fs = require('fs');
const fleekStorage = require('@fleekhq/fleek-storage-js');

const tmpFileName = 'tmp.mp4';

async function downloadVideo(url) {
  const path = 'tmp.mp4';
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
  const fileName = getFileName(url);

  try {
    await downloadVideo(url);
  } catch (e) {
    throw new Error("Couldn't download video.");
  }

  try {
    const data = fs.readFileSync(tmpFileName);
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

module.exports = {
  uploadFromUrl,
};
