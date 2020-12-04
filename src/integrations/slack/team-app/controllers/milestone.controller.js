import { WebClient } from '@slack/web-api';
import { getCurrentMilestoneOfCohortDelta, markMilestoneReview } from '../../../../models/cohort_milestone';
import { Cohort, getLearnersFromCohorts } from '../../../../models/cohort';
import { Milestone } from '../../../../models/milestone';
import { createOrUpdateCohortBreakout } from '../../../../models/cohort_breakout';
import { Topic } from '../../../../models/topic';
import { composeMilestoneModal, milestoneReviewMessage } from '../views/milestone.view';
import { getLearnerBreakoutsForACohortBreakout } from '../../../../models/learner_breakout';
import { getProfile } from '../../../../models/user';
import logger from '../../../../util/logger';

const { SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);

export const showMilestoneDetails = (cohort_id, trigger_id) => {
  getCurrentMilestoneOfCohortDelta(cohort_id)
    .then(milestone => {
      // logger.info(milestone);
      const view = composeMilestoneModal(milestone);
      return web.views.open({
        view,
        trigger_id,
      });
    }).catch(err => logger.error(err));
};

export const markMilestoneAsReviewed = (payload, respond) => {
  const cohort_milestone_id = payload.actions[0].value;

  markMilestoneReview(cohort_milestone_id)
    .then(({ milestoneId, cohortId }) =>
      // logger.info('milestone review saved!', milestoneId);
      // respond({ text: 'Milestone review saved' });
      Promise.all([
        Milestone.findByPk(milestoneId),
        Cohort.findByPk(cohortId),
      ])
        .then(([milestone, cohort]) => {
          const view = milestoneReviewMessage(milestone, cohort, 'user');
          web.chat.postMessage(view);
        })
        .catch(err => {
          logger.error(err);
          // respond({ text: 'Failed to save review' });
        }));
};

export const showCompletedBreakoutOnSlack = (
  topic_id, cohort_id, username, cohort_breakout_id,
) => Promise.all([
  Topic.findByPk(topic_id),
  Cohort.findByPk(cohort_id),
  getLearnersFromCohorts([cohort_id])
    .then(data => JSON.stringify(data))
    .then(_data => JSON.parse(_data)[0].learners),
  getLearnerBreakoutsForACohortBreakout(cohort_breakout_id),
])
  .then(async ([topic, cohort, cohortLearners, learnerBreakouts]) => {
    const inactiveLearners = await Promise.all(learnerBreakouts
      .filter(lb => !cohortLearners.includes(lb.learner_id))
      .map(_lb => getProfile(_lb.learner_id).then(_data => _data.get({ plain: true }))));

    return web.chat.postMessage({
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
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: (inactiveLearners.length > 0) ? `Inactive Learners : ${inactiveLearners.map(il => il.email).join(', ')}` : '  ',
          },
        },
      ],
      channel: process.env.SLACK_CLOCKWORK_CHANNEL,
    });
  })
  .catch(err => logger.info('SEND SLACK MESSAGE ERROR', err));

export const sendMessageToSlackChannel = (text, context, channel) => web.chat.postMessage({
  text,
  blocks: [
    {
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: context,
      }],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    },
  ],
  channel,
})
  .catch(err => logger.error(err));

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
      channel: process.env.SLACK_CLOCKWORK,
    })
      .catch(err => logger.error(err)));

  createOrUpdateCohortBreakout(topic_id, cohort_id, new Date())
    .then(sendMessageToSlack)
    .catch(err => logger.error(err));
};
