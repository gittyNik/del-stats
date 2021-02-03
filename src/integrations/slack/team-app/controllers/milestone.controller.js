import { WebClient } from '@slack/web-api';
import _ from 'lodash';
import { getCurrentMilestoneOfCohortDelta, markMilestoneReview } from '../../../../models/cohort_milestone';
import { Cohort, getLearnersFromCohorts } from '../../../../models/cohort';
import { Milestone } from '../../../../models/milestone';
import { createOrUpdateCohortBreakout } from '../../../../models/cohort_breakout';
import { Topic } from '../../../../models/topic';
import { composeMilestoneModal, milestoneReviewMessage } from '../views/milestone.view';
import { getLearnerBreakoutsForACohortBreakout } from '../../../../models/learner_breakout';
import { getProfile } from '../../../../models/user';

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
    }).catch(err => console.error(err));
};

export const markMilestoneAsReviewed = (payload, respond) => {
  const cohort_milestone_id = payload.actions[0].value;

  markMilestoneReview(cohort_milestone_id)
    .then(({ milestoneId, cohortId }) =>
      // console.log('milestone review saved!', milestoneId);
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
          console.error(err);
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
  .catch(err => console.log('SEND SLACK MESSAGE ERROR', err));

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
  .catch(err => console.log(err));

export const postOverlappingBreakouts = async (n_days, overlappingBreakouts, duplicateField) => {
  const channelId = process.env.SLACK_PE_SCHEDULING_CHANNEL;
  let n_day = new Date();
  n_day.setDate(n_day.getDate() + n_days);
  let context = `<!channel> Overlapping *${duplicateField}* sessions for date: *${n_day.getDate()}-${n_day.getMonth() + 1}-${n_day.getFullYear()}*`;

  if (_.isEmpty(overlappingBreakouts)) {
    const textMessage = `No ${duplicateField} overlapping sessions for the day`;
    return sendMessageToSlackChannel(textMessage, context, channelId);
  }
  const postOnChannel = async (textBody) => {
    const payloadBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: textBody,
        },
      },
    ];
    try {
      const slackResponse = await web.chat.postMessage({
        channel: channelId,
        blocks: [
          {
            type: 'context',
            elements: [{
              type: 'mrkdwn',
              text: context,
            }],
          },
          {
            type: 'divider',
          },
          ...payloadBlocks,
          {
            type: 'context',
            elements: [{
              type: 'mrkdwn',
              text: 'Any changes to the above will be updated only on <https://delta.soal.io|DELTA> - please keep an eye out.',
            }],
          },
        ],
      });
      return slackResponse;
    } catch (err) {
      console.error(err);
      console.error(`Failed to post on slack channel ${channelId} and breakout text: ${textBody}`);
      return false;
    }
  };
  let data = [];
  let breakout_text = '';

  Object.entries(overlappingBreakouts).forEach(([key, breakout]) => {
    // let b_type;
    breakout_text += `${duplicateField}: *${key}*\n\n${'_'.repeat(50)}\n\n`;
    breakout.forEach(eachBreakout => {
      let b_topic;
      switch (eachBreakout.type) {
        case 'lecture':
          // b_type = (breakout.details.type === 'tep') ? 'Tech Breakouts' : 'MindCasts';
          b_topic = `*${eachBreakout.breakout_time}* ${eachBreakout.topics}\n`;
          breakout_text += `${b_topic}`;
          break;
        case 'reviews':
          // b_type = 'Reviews';
          b_topic = `*${eachBreakout.breakout_time}* ${eachBreakout.topics}\n`;
          breakout_text += b_topic;
          break;
        case 'assessment':
          b_topic = `*${eachBreakout.breakout_time}* ${eachBreakout.topics}\n`;
          breakout_text += b_topic;
          break;
        // no default
      }
    });
    breakout_text += `${'_'.repeat(50)}\n`;
  });
  try {
    // console.log(breakout_text);
    const res = await postOnChannel(breakout_text);
    data.push(res);
  } catch (err) {
    data.push({
      text: 'failed to postOnChannel',
    });
  }
  return data;
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
      channel: process.env.SLACK_CLOCKWORK,
    })
      .catch(err => console.log(err)));

  createOrUpdateCohortBreakout(topic_id, cohort_id, new Date())
    .then(sendMessageToSlack)
    .catch(err => console.log(err));
};
