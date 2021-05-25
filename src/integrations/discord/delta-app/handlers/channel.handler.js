/* eslint-disable import/prefer-default-export */

import logger from '../../../../util/logger';
import { createChannelForCohort } from '../controllers/channel.controller';

export const createChannelForCohortAPI = async (req, res) => {
  try { // const { cohort_id, emailList } = req.body;
    const { cohort_id } = req.body;

    const message = await createChannelForCohort({ cohort_id });

    return res.json({ type: 'success', message });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};
