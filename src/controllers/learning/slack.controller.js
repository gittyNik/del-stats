import { beginChannel } from '../../models/slack_channels';

export const createChannelForCohort = async (req, res) => {
  const { cohort_id, emailList } = req.body;
  const response = await beginChannel(cohort_id, emailList);
  res.json(response);
};

// dummy
export const addToChannel = (req, res) => {
  res.send('Adds a learner to a channel.');
};
