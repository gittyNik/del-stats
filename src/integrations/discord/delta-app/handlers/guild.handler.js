import logger from '../../../../util/logger';
import { serverSetup } from '../controllers/guild.controller';
// import { addGuildMember } from '../controllers/guild.controller';
// eslint-disable-next-line import/prefer-default-export
export const getGuild = async (req, res) => {
  logger.info();
  return res.json({ message: 'under construction' });
};

export const serverSetupAPI = async (req, res) => {
  const { program_ids } = req.body;

  try {
    const data = await serverSetup({ program_ids });
    return res.json({ type: 'success', message: data });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};
