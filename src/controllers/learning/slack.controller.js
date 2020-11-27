import { beginChannel, addLearnersToDSAChannels } from '../../models/slack_channels';

export const createChannelForCohort = async (req, res) => {
  const { cohort_id, emailList } = req.body;
  const response = await beginChannel(cohort_id, emailList);
  res.json(response);
};

export const addLearnersToDSAChannelsAPI = async (req, res) => {
  const { cohort_id } = req.params;
  try {
    const response = await addLearnersToDSAChannels(cohort_id);
    res.status(200).json({
      text: `Add learners in cohort[${cohort_id}] to DS-Algo channel`,
      data: response,
      type: 'success',
    })
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
