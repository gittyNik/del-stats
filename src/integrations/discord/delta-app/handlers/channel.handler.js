/* eslint-disable import/prefer-default-export */

import { createChannelForCohort } from '../controllers/channel.controller';

export const createChannelForCohortAPI = async (req, res) => {
  // const { cohort_id, emailList } = req.body;
  const { cohort_id } = req.body;

  const message = createChannelForCohort({ cohort_id });

  res.json({ type: 'success', message });
};
