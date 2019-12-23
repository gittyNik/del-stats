import { WebClient } from '@slack/web-api';
import { Cohort } from '../../../../models/cohort';
import { Topic } from '../../../../models/topic';
import { getCurrentMilestoneOfCohort } from '../../../../models/cohort_milestone';
import { composeMilestoneModal, composeBreakoutMessage } from '../views/milestone.view';

const { SLACK_DELTA_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_DELTA_BOT_TOKEN);

export const showMilestoneDetails = (cohort_id, trigger_id) => {
  getCurrentMilestoneOfCohort(cohort_id)
    .then(composeMilestoneModal)
    .then(view => {
      console.log(0);
      return web.views.open({
        view,
        trigger_id,
      });
    })
    .catch(err => console.log(err));
};

export const requestTopicBreakout = (topic_id, cohort_id, username) => {
  const sendMessageToChannel = Promise.all([
    Topic.findByPk(topic_id),
    Cohort.findByPk(cohort_id),
  ])
    .then(([topic, cohort]) => composeBreakoutMessage({ topic, cohort, username }))
    .then(web.chat.postMessage);

  // TODO: schedule the breakout on database
  sendMessageToChannel()
    .catch(err => console.log(err));
};
