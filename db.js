const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ tweets: [] }).write();

const saveTweet = tweet => {
  const tweetData = {
    ...tweet,
    id: db.getState().tweets.length + 1,
  };

  db.get('tweets').push(tweetData).write();
};

const getTweets = () => {
  const tweets = db.getState();
  return tweets;
};

module.exports = {
  saveTweet,
  getTweets,
};
