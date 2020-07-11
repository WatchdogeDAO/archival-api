const request = require('request');
const fs = require('fs');
const fleekStorage = require('@fleekhq/fleek-storage-js');

const fileName = 'sample.mp4';

const uploadFromUrl = async url => {
  const options = {
    url,
    method: 'get',
    encoding: null,
  };

  request(options, async (error, response, body) => {
    if (error) {
      console.error('error:', error);
    } else {
      console.log('Response: StatusCode:', response && response.statusCode);
      console.log(
        'Response: Body: Length: %d. Is buffer: %s',
        body.length,
        body instanceof Buffer
      );
      const uploadedFile = await fleekStorage.upload({
        apiKey: process.env.FLEEK_API_KEY,
        apiSecret: process.env.FLEEK_API_SECRET,
        key: 'test.mp4',
        data: body,
      });
      console.log('I give you the', uploadedFile);
    }
  });
};

const getFileName = url => url.slice(-27, -7);

// const listFiles = async () => {
//   const files = await fleekStorage.listFiles({
//     apiKey: process.env.FLEEK_API_KEY,
//     apiSecret: process.env.FLEEK_API_SECRET,
//     getOptions: ['bucket', 'key', 'hash', 'publicUrl'],
//   });
//   console.log(files);
// };

module.exports = {
  uploadFromUrl,
};
