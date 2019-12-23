import { WebClient } from '@slack/web-api';
import { getCurrentMilestoneOfCohort } from '../../../../models/cohort_milestone';
import { Cohort } from '../../../../models/cohort';
import { startBreakout } from '../../../../models/cohort_breakout';
import { Topic } from '../../../../models/topic';
import { composeMilestoneModal } from '../views/milestone.view';

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

export const markTopicAsFinished = (topic_id, cohort_id, username) => {
  const sendMessageToSlack = Promise.all([
    Topic.findByPk(topic_id),
    Cohort.findByPk(cohort_id),
  ])
    .then(([topic, cohort]) => web.chat.postMessage({
      text: `Breakout on ${topic.title} is done for ${cohort.name}`,
      blocks: [
        {
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `${cohort.name}-${cohort.start_date.getFullYear()} @${cohort.location}`,
          }],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Breakout on *${topic.title}* is done (marked by @${username})`,
          },
        },
      ],
      channel: 'clockwork',
    })
      .catch(err => console.log(err)));

  startBreakout(topic_id, cohort_id, new Date())
    .then(sendMessageToSlack)
    .catch(err => console.log(err));
};
