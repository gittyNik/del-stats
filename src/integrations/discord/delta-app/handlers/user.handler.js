/* eslint-disable import/prefer-default-export */
import logger from '../../../../util/logger';
import { hasDiscordSocialConnection } from '../controllers/user.controller';

export const hasDiscordSocialConnectionAPI = async (req, res) => {
  const { user_id } = req.query;

  try {
    const data = await hasDiscordSocialConnection({ user_id });
    return res.json({ type: 'success', message: data });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};
