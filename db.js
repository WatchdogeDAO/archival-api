const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ tweets: [] }).write();

const saveTweet = tweet => {
  console.log('Saving tweet');
  db.get('tweets').push(tweet).write();
  console.log('Done');
};

const getTweets = () => {
  const tweets = db.get('tweets');
  return tweets;
};

module.exports = {
  saveTweet,
  getTweets,
};
