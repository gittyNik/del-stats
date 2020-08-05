import web from '../client';

export const postMessage = async ({
  channel, text,
}) => {
  try {
    const res = await web.chat.postMessage({
      channel,
      text,
    });
    if (res.ok) {
      return res;
    }
    return res.error;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const postEphemeral = async ({
  attachments, channel, text, user
}) => {
  console.log('adsfa');
  return true;
};
