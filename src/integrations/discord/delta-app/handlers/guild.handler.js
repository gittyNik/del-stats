/* eslint-disable import/prefer-default-export */
import logger from '../../../../util/logger';
import { serverSetup } from '../controllers/guild.controller';
// import { addGuildMember } from '../controllers/guild.controller';

export const serverSetupAPI = async (req, res) => {
  const { program_ids, cleanFirst } = req.body;

  try {
    const data = await serverSetup({ program_ids, cleanFirst });
    return res.json({ type: 'success', message: data });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};
