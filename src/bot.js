const Twitter = require('twitter-lite');
const { uploadFromUrl } = require('./storage');
const { saveTweet } = require('./db');
const abi = require('../abis/archivers.json');
const Web3 = require('web3');

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/bec1aef3e4574168865445df1da8958c'
  )
);

let client;
const TWEET_IS_NOT_VIDEO =
  "I'm sorry, there doesn't seem to be a video that I can archive. Mention me with '@watchdogedao #archive' as a reply to relevant videos.";
const NOT_APPROVED_ARCHIVER =
  "I'm sorry, you need to be approved before you can archive tweets.";

/**
 * Main function to run the bot.
 */
const runBot = () => {
  console.log('Bot Starting up...');
  client = new Twitter({
    consumer_key: process.env.CONSUMER_API_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });

  const parameters = { follow: '1280934313073299456', tweet_mode: 'extended' };

  const handleIncomingTweet = async tweet => {
    console.log('New tweet received:', tweet.id_str);
    // Exit early if the sender is the bot account.
    if (tweet.user.id_str === '1280934313073299456') {
      console.log('No need to handle my own tweets.');
      return;
    }
    // Exit early if the tweet isn't a reply.
    if (!isReply(tweet)) {
      console.log("The tweet isn't a reply. No need to handle.");
      return;
    }
    // Exit early if the tweet isn't an archive request.
    if (!isArchiveRequest(tweet)) {
      console.log("The tweet isn't an archive request. No need to handle.");
      return;
    }
    // Handle if the requestor is not an approved archiver.
    const canArchive = await isApprovedArchiver(tweet);
    if (!canArchive) {
      console.log("Denied. The tweeter doesn't have the correct permisions.");
      return reply(NOT_APPROVED_ARCHIVER, tweet.id_str);
    }
    // Get the target tweet
    const targetTweet = await client.get('statuses/show', {
      id: tweet.in_reply_to_status_id_str,
      tweet_mode: 'extended',
    });
    // Handle if the target tweet doesn't have a video.
    if (!isVideo(targetTweet)) {
      console.log("The target tweet doesn't contain a video. Giving feedback.");
      return reply(TWEET_IS_NOT_VIDEO, tweet.id_str);
    }
    // Process and save the tweet.
    const variants = targetTweet.extended_entities.media[0].video_info.variants;
    const highestBitrateVid = getHighestBitrate(variants);
    const videoUrl = variants[highestBitrateVid].url;
    console.log(`Got the tweet's video URL: ${videoUrl}`);
    const videoHash = await uploadFromUrl(videoUrl);
    console.log(`Uploaded the video to Fleek. The hash is ${videoHash}`);
    try {
      saveTweet({
        text: targetTweet.full_text,
        hash: videoHash,
        archiverHandle: tweet.user.screen_name,
        tweetUrl: `https://twitter.com/${targetTweet.user.screen_name}/status/${targetTweet.id_str}`,
        date: targetTweet.created_at,
      });
      console.log(`Tweet ${targetTweet.id_str} Saved successfuly to the DB.`);
    } catch (e) {
      console.log(`Couldn't save the tweet ${targetTweet.id_str}`);
    }
  };

  const stream = client
    .stream('statuses/filter', parameters)
    .on('data', handleIncomingTweet);
};

const getHighestBitrate = variants => {
  highestIndex = 0;
  highestBitrate = 0;
  variants.forEach((variant, i) => {
    const bitrate = variant.bitrate;
    if (bitrate !== undefined) {
      if (bitrate > highestBitrate) {
        highestIndex = i;
        highestBitrate = bitrate;
      }
    }
  });

  return highestIndex;
};

const isReply = tweet => {
  return tweet.in_reply_to_status_id_str !== null ? true : false;
};

const isVideo = tweet => {
  if (tweet.extended_entities === undefined) {
    return false;
  } else {
    if (tweet.extended_entities.media[0].type !== 'video') {
      return false;
    }
  }

  return true;
};

const isArchiveRequest = tweet => {
  return tweet.text.includes('#archive') ? true : false;
};

const isApprovedArchiver = async tweet => {
  try {
    const instance = new web3.eth.Contract(abi, process.env.ARCHIVERS_ADDRESS);
    const isArchiver = await instance.methods
      .isArchiver(tweet.user.id_str)
      .call();
    return isArchiver ? true : false;
  } catch (e) {
    console.log(`Couldn't check the archivers smart contract, ${e}`);
    return false;
  }
};

/**
 *
 * @param {string} text - The text to send as tweet.
 * @param {string} id - The id in string form of the tweet to reply.
 */
const reply = async (text, id) => {
  try {
    const tweet = await client.post('statuses/update', {
      status: text,
      in_reply_to_status_id: id,
      auto_populate_reply_metadata: true,
    });
    console.log(`Replied to ${id} successfully with tweet ${tweet.id_str}`);
  } catch (e) {
    console.log(`Couldn't reply to ${id}, error: ${e}`);
  }
};

module.exports = {
  runBot,
  isApprovedArchiver,
  isVideo,
  isReply,
  isArchiveRequest,
  getHighestBitrate,
};