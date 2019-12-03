import { WebClient } from '@slack/web-api';
import { getCurrentMilestoneOfCohort } from '../../../../models/cohort_milestone';
import { Cohort } from '../../../../models/cohort';
import { Topic } from '../../../../models/topic';
import { composeMilestoneModal } from './milestone.view';

const { SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);

export const showMilestoneDetails = (cohort_id, trigger_id) => {
  getCurrentMilestoneOfCohort(cohort_id)
    .then(milestone => {
      // console.log(milestone);
      const view = composeMilestoneModal(milestone);
      return web.views.open({
        view,
        trigger_id,
      });
    }).catch(err => console.log(err));
};

export const markTopicAsFinished = (topic_id, cohort_id) => {
  console.log(topic_id, cohort_id);
  Promise.all([
    Topic.findByPk(topic_id),
    Cohort.findByPk(cohort_id),
  ])
    .then(([topic, cohort]) => web.chat.postMessage({
      text: `Breakout on *${topic.title}* is done for ${cohort.name}-${cohort.location}-${cohort.start_date.getFullYear()}`,
      channel: '#dev-talk',
    }))
    .catch(err => console.log(err));
};
