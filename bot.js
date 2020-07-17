const Twitter = require('twitter-lite');
const { uploadFromUrl } = require('./storage');
const { saveTweet } = require('./db');

let client;
const TWEET_IS_NOT_VIDEO =
  "I'm sorry, there doesn't seem to be a video that I can archive. Mention me with '@watchdogedao #archive' in reply to relevant videos.";

const runBot = () => {
  console.log('Bot Starting');
  client = new Twitter({
    consumer_key: process.env.CONSUMER_API_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });

  const parameters = { follow: '1280934313073299456', tweet_mode: 'extended' };

  const handleIncomingTweet = async tweet => {
    // TODO: Check that it was an archive request.
    // TODO: Check if the person is member of the dao.

    // Only handle tweets that are a reply.
    if (!isReply(tweet)) return;

    // Get the target tweet
    const targetTweet = await client.get('statuses/show', {
      id: tweet.in_reply_to_status_id_str,
      tweet_mode: 'extended',
    });

    // Handle if the target tweet doesn't have a video.
    if (!isVideo(targetTweet)) {
      return reply(TWEET_IS_NOT_VIDEO, tweet.id_str);
    }
    const variants = targetTweet.extended_entities.media[0].video_info.variants;
    const highestBitrateVid = getHighestBitrate(variants);
    const videoUrl = variants[highestBitrateVid].url;
    const videoHash = await uploadFromUrl(videoUrl);
    saveTweet({
      text: targetTweet.full_text,
      hash: videoHash,
      archiverHandle: tweet.user.screen_name,
      tweetUrl: `https://twitter.com/${targetTweet.user.screen_name}/status/${targetTweet.id_str}`,
      date: targetTweet.created_at,
    });
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

const reply = (text, id) => {
  client.post('statuses/update', {
    status: text,
    in_reply_to_status_id: id,
    auto_populate_reply_metadata: true,
  });
};

module.exports = {
  runBot,
};
