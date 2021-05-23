import web from '../client';
import logger from '../../../../util/logger';

export const postMessage = async ({
  channel, text, blocks,
}) => {
  console.log(`***************`)
  try {
    console.log(`***************`, web)
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
    logger.error(err);
    return false;
  }
};

export const postEphemeral = async ({
  attachments, channel, text, user,
}) => {
  logger.info('example');
  return true;
};
