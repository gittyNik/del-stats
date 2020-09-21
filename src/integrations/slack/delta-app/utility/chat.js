import web from '../client';

export const postMessage = async ({
  channel, text, blocks,
}) => {
  try {
    const res = await web.chat.postMessage({
      channel,
      text,
      blocks,
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
  console.log('example');
  return true;
};
