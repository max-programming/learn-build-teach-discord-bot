import { sendTweet } from './utils/twitter';
import { getShareToTweet, markShareAsTweeted } from './db/shares';
import { getDiscordUserById } from './db/discordUser';
import cron from 'node-cron';
import { sendEmailAlert } from './utils/email';
import { Share } from './types/types';

const tweetNextShare = async () => {
  console.info('Looking for shares to tweet');
  try {
    const share = await getShareToTweet();
    if (!share) return;

    const tweet = await getTweetFromShare(share);

    if (!tweet) return;
    console.info('Potential tweet', tweet);

    if (process.env.SEND_TWEETS === 'TRUE') {
      console.info('Sending tweet');
      await sendTweet(tweet, share.imageUrl || '');
      await sendEmailAlert('Tweet Sent', `Tweet: ${tweet}`);
      markShareAsTweeted(share.id);
    }
  } catch (err) {
    console.error(err);
    console.error('Something went wrong trying to send a tweet');
  }
};

export const getTweetFromShare = async (share: Share) => {
  const existingUser = await getDiscordUserById(share.discordUserId);
  //TODO: any other error handling we need here?
  if (!existingUser?.username) return null;

  const twitterUsername = existingUser?.twitter;
  const taggedUser = twitterUsername
    ? `@${twitterUsername.replace('@', '')}`
    : existingUser.username;
  return `Check out "${share.title}" from ${taggedUser} of the #LearnBuildTeach community! #bot \n\n ${share.link}`;
};

//tweet available share (if there is one) every morning at 8am GMT
cron.schedule('0 8 * * *', tweetNextShare);
