import { WebClient } from '@slack/web-api';
import { getCurrentMilestoneOfCohortDelta, markMilestoneReview } from '../../../../models/cohort_milestone';
import { Cohort } from '../../../../models/cohort';
import { Milestone } from '../../../../models/milestone';
import { createOrUpdateCohortBreakout } from '../../../../models/cohort_breakout';
import { Topic } from '../../../../models/topic';
import { composeMilestoneModal, milestoneReviewMessage } from '../views/milestone.view';

const { SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);

export const showMilestoneDetails = (cohort_id, trigger_id) => {
  getCurrentMilestoneOfCohortDelta(cohort_id)
    .then(milestone => {
      // console.log(milestone);
      const view = composeMilestoneModal(milestone);
      return web.views.open({
        view,
        trigger_id,
      });
    }).catch(err => console.log(err));
};

export const markMilestoneAsReviewed = (payload, respond) => {
  const cohort_milestone_id = payload.actions[0].value;

  markMilestoneReview(cohort_milestone_id)
    .then(({ milestoneId, cohortId }) => {
      console.log('milestone review saved!', milestoneId);
      // respond({ text: 'Milestone review saved' });
      return Promise.all([
        Milestone.findByPk(milestoneId),
        Cohort.findByPk(cohortId),
      ])
        .then(([milestone, cohort]) => {
          const view = milestoneReviewMessage(milestone, cohort, 'user');
          web.chat.postMessage(view);
        })
        .catch(err => {
          console.log(err);
          // respond({ text: 'Failed to save review' });
        });
    });
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

  createOrUpdateCohortBreakout(topic_id, cohort_id, new Date())
    .then(sendMessageToSlack)
    .catch(err => console.log(err));
};
