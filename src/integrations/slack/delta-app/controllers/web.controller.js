import { composeCatalystBreakoutMessage } from '../views/breakout.view';
import web from '../client';
import { User, getProfile } from '../../../../models/user';
import { Cohort, getCohortIdFromLearnerId, getLearnersFromCohorts } from '../../../../models/cohort';
import { CohortBreakout, getCohortBreakoutById } from '../../../../models/cohort_breakout';
import { postMessage } from '../utility/chat';
import { getChannelIdForCohort, getSlackIdsForUsersInSPE } from '../../../../models/slack_channels';

import { getLearnerBreakoutsForACohortBreakout } from '../../../../models/learner_breakout';
import { logger } from '../../../../util/logger';

const REVIEW_TEMPLATE = (team_number) => `Team: ${team_number}, Reviewer is reminding you to join the review. Please join from DELTA`;
const ASSESSMENT_TEMPLATE = (learner) => `Psst! Looks like it's time for your Assessment, <@${learner}>. Please join from DELTA right away; your reviewer is waiting.`;
const LEARNER_REVIEW_TEMPLATE = 'Reviewer is reminding you to join the review. Please join from DELTA';
const BREAKOUT_TEMPLATE = 'It\'s time to get your thinking hats on! Please join the BreakOut from DELTA now';
const QUESTIONAIRE_TEMPLATE = 'The Question Hour is upon us. Please join the session from DELTA and ask away!';

export const sendMessage = (req, res) => {
  const {
    userId, cohortId, breakoutId, topics,
  } = req.body;
  Promise.all([
    User.findByPk(userId),
    Cohort.findByPk(cohortId),
    CohortBreakout.findByPk(breakoutId),
  ])
    .then(([user, cohort, breakout]) => composeCatalystBreakoutMessage(user, cohort, breakout, topics))
    .then(web.chat.postMessage)
    .then(() => {
      res.status(200).json({
        text: 'Message sent to breakouts channel',
      });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const notifyLearnersInChannel = async (req, res) => {
  let {
    learner_id, text, cohort_id, type, team_number,
  } = req.body;
  let email;
  if (learner_id) {
    let learner = await getProfile(learner_id);
    email = learner.email;
    if (type === 'reviews') {
      text = LEARNER_REVIEW_TEMPLATE;
    }
  }
  let slackUserResponse;
  let slackUserId;
  try {
    if (learner_id) {
      slackUserResponse = await web.users.lookupByEmail({ email });
      slackUserId = slackUserResponse.user.id;
    }
    if (typeof cohort_id === 'undefined') {
      cohort_id = await getCohortIdFromLearnerId(learner_id);
    }
    const channel_id = await getChannelIdForCohort(cohort_id);
    // console.log(channel_id);
    if (!text) {
      switch (type) {
        case 'reviews':
          text = REVIEW_TEMPLATE(team_number);
          break;
        case 'assessment':
          text = ASSESSMENT_TEMPLATE(slackUserId);
          break;
        case 'lecture':
          text = BREAKOUT_TEMPLATE;
          break;
        case 'question_hour':
          text = QUESTIONAIRE_TEMPLATE;
          break;
        // no default
      }
    }
    const updatedText = (req.body.cohort_id) ? `<!channel> ${text}` : text;
    const post_res = await postMessage({ channel: channel_id, text: updatedText });
    return res.status(200).json({
      text: 'Message posted on the channel',
      data: {
        channel: post_res.channel,
        ts: post_res.ts,
        message: post_res.message,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      text: 'Failed to notify on the slack channel',
    });
  }
};

export const postAttendaceInCohortChannel = async (cohort_breakout_id) => {
  const cohortBreakout = await getCohortBreakoutById(cohort_breakout_id);
  const {
    type, cohort_id, catalyst_id, details,
  } = cohortBreakout;
  const cohortSlackChannel = await getChannelIdForCohort(cohort_id);
  const learner_breakouts = await getLearnerBreakoutsForACohortBreakout(cohort_breakout_id);
  const cohortLearners = await getLearnersFromCohorts([cohort_id])
    .then(data => JSON.stringify(data))
    .then(_data => JSON.parse(_data)[0].learners);
  const attendedLearners = learner_breakouts
    .filter(learner_breakout => {
      const { learner_id, attendance } = learner_breakout;
      if (cohortLearners.includes(learner_id) && attendance === true) {
        return true;
      }
      return false;
    }).map(lb => lb.learner_id);
  const absentLearners = learner_breakouts
    .filter(learner_breakout => {
      const { learner_id, attendance } = learner_breakout;
      if (cohortLearners.includes(learner_id) && attendance === false) {
        return true;
      }
      return false;
    }).map(lb => lb.learner_id);
  let slackIdsOfAttendedLearners = await getSlackIdsForUsersInSPE(attendedLearners);
  let slackIdsOfAbsentLearners = await getSlackIdsForUsersInSPE(absentLearners);
  let title;
  if (type === 'lecture') {
    const slackIdOfCatalyst = await getSlackIdsForUsersInSPE([catalyst_id]);
    title = `Attendance record for *<@${slackIdOfCatalyst}>*'s breakout on \n${details.topics}`;
  }
  if (type === 'reviews') {
    title = `Attendance of ${details.topics}`;
  }
  if (type === 'assessment') {
    title = `Attendance of ${details.topics}`;
  }

  const payloadBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: title,
      },
      fields: [
        {
          type: 'mrkdwn',
          text: `*PRESENT*\n ${slackIdsOfAttendedLearners.map(l => `<@${l}>`).join('\n')}`,
        },
        {
          type: 'mrkdwn',
          text: `ABSENT:\n ${slackIdsOfAbsentLearners.map(l => `<@${l}>`).join('\n')}`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ];
  try {
    const slackResponse = await postMessage({
      channel: cohortSlackChannel,
      blocks: payloadBlocks,
    });
    return slackResponse;
  } catch (err) {
    logger.error(err);
    return false;
  }
};
