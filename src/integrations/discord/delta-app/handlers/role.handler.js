/* eslint-disable import/prefer-default-export */
import logger from '../../../../util/logger';
import { createProgramRole } from '../controllers/role.controller';

export const createProgramRoleAPI = async (req, res) => {
  const { guild_id, program_id } = req.body;

  try {
    const data = await createProgramRole({ guild_id, program_id });
    return res.json({ type: 'success', message: data });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};
