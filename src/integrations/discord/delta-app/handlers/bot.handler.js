/* eslint-disable import/prefer-default-export */

import logger from '../../../../util/logger';
import { sendMessage } from '../controllers/bot.controller';

export const sendMessageAPI = async (req, res) => {
  try {
    const { channel_id, msg } = req.body;
    await sendMessage({ channel_id, msg });
    return res.send({ message: 'message sent!', type: 'successful' });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};
