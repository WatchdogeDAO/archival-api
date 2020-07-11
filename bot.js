const Twitter = require('twitter-lite');

const runBot = () => {
  const client = new Twitter({
    consumer_key: process.env.CONSUMER_API_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });

  const parameters = { follow: '1280934313073299456', tweet_mode: 'extended' };

  const handleIncomingTweet = async tweet => {
    // TODO: Check that it was an archive request.
    // TODO: Check if the person is member of the dao.
    // TODO: Check if the target tweet is a video.
    // Get target tweet. Use in_reply_to_status_id_str
    const targetTweet = await client.get('statuses/show', {
      id: tweet.in_reply_to_status_id_str,
      tweet_mode: 'extended',
    });
    const variants = targetTweet.extended_entities.media[0].video_info.variants;
    const highestBitrateVid = getHighestBitrate(variants);
    const videoUrl = variants[highestBitrateVid].url;

    console.log(videoUrl);
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

  if (highestBitrate === 0) {
    throw new Error('No bitrate could be selected.');
  } else {
    return highestIndex;
  }
};

const getVideoNameFromUrl = url => url.slice(-27, -7);

module.exports = {
  runBot,
};
