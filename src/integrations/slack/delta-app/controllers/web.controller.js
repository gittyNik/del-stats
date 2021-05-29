import moment from 'moment';
import { composeCatalystBreakoutMessage } from '../views/breakout.view';
import web from '../client';
import { User, getProfile } from '../../../../models/user';
import { Cohort, getCohortIdFromLearnerId, getLearnersFromCohorts } from '../../../../models/cohort';
import { CohortBreakout, getCohortBreakoutById } from '../../../../models/cohort_breakout';
import { postMessage } from '../utility/chat';
import { getChannelIdForCohort, getSlackIdsForUsersInSPE } from '../../../../models/slack_channels';

import { getLearnerBreakoutsForACohortBreakout } from '../../../../models/learner_breakout';
import {
  getRubricsByMilestone,
} from '../../../../models/rubrics';
import {
  getWeekDay,
} from '../../../../util/utility';
import logger from '../../../../util/logger';

const REVIEW_TEMPLATE = (team_number) => `Team: ${team_number}, Reviewer is reminding you to join the review. Please join from DELTA`;
const LEARNER_REVIEW_TEMPLATE = (learner) => `<@${learner}> Reviewer is reminding you to join the review. Please join from DELTA`;
const ASSESSMENT_TEMPLATE = (learner) => `Psst! Looks like it's time for your Assessment, <@${learner}>. Please join from DELTA right away; your reviewer is waiting.`;
const BREAKOUT_TEMPLATE = 'It\'s time to get your thinking hats on! Please join the BreakOut from DELTA now';
const LEARNER_BREAKOUT_TEMPLATE = (learner) => `Catalyst is reminding <@${learner}> to join the breakout. Please join from Delta`;
const QUESTIONAIRE_TEMPLATE = 'The Question Hour is upon us. Please join the session from DELTA and ask away!';
const ATTENDANCE_TEMPLATE = (learner, topics, timeMinutes) => `<@${learner}> Looks like you have been in the breakout on ${topics} for only ${timeMinutes} minutes.`;
const ASSESSMENT_MESSAGE_TEMPLATE = (phase, date, currentDay, topicsString) => `Hello, @channel!
Your ${phase} Reflection Week begins on ${date}.
In this week, from ${currentDay}, ${date} for one week, you will get time to reflect on your growth so far.

~ *What will happen in this week?*
${phase} Assessments. You will be participating in 1-on-1 review calls, and receiving feedback on your learning progress thus far.

~ *What to expect in the Assessment?*
An external reviewer will be asking some questions related to the Milestones covered in the ${phase}. You may also be asked to write code for some of these topics:\n\n${topicsString}

~ *What happens after the Assessment?*
At the end this week, you will receive your Assessment feedback. Based on this feedback, some of you may be asked to join a new cohort and spend more time working on your ${phase} milestones. Because everyone learns at their own pace, needing more time isn’t a bad thing. This is not a punishment.

~ To make the most of this week, here’s what we suggest you do before, and even after, your assessment:
Revisit MS Review feedback for each milestone of the ${phase}. Evaluate whether or not you were able to implement the MS Review feedback in the next MS. Did you find it helpful?
Practice! Practice! Practice! Reading code is helpful, but what’s even better is writing it. Go back to your MiniMS, attempt more, revisit the ones you have already attempted and try improving upon them.
Pick a MS you feel you could have built better and try building it on your own.

Please add your queries, if any, to this thread, and we’ll get to addressing them.

~ Note: There will be no BreakOuts or Mindcasts scheduled for you this week.
You may see some on DELTA but they will soon be rescheduled and moved to next week. You will have access to your catalysts/educators to get guidance on anything you may be stuck with.`;

export const sendAssessmentMessage = async (program, date, phase, cohort_id) => {
  let dateObject = new Date(date);
  const currentDay = getWeekDay(dateObject);
  const type = phase.includes('Core') ? 'core-phase' : 'focus-phase';
  const topicsForAssessments = await getRubricsByMilestone({ program, type });
  let topicsString;
  if (type === 'core-phase') {
    let topicArray = topicsForAssessments.map(topics => topics.rubric_name);
    topicsString = topicArray.join('\n- ');
  } else {
    let frontendTopics = [];
    let backendTopics = [];
    topicsForAssessments.map(topics => {
      if (topics.path === 'frontend') {
        frontendTopics.push(topics.rubric_name);
      } else {
        backendTopics.push(topics.rubric_name);
      }
    });
    topicsString = `Frontend Topics: \n- ${frontendTopics.join('\n- ')}\n Backend Topics \n\n- ${backendTopics.join('\n- ')}`;
  }
  let text = ASSESSMENT_MESSAGE_TEMPLATE(phase, date, currentDay, topicsString);
  const channel_id = await getChannelIdForCohort(cohort_id);
  return postMessage({ channel: channel_id, text });
};

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
      logger.error(err);
      res.sendStatus(500);
    });
};

export const notifyAttendanceLearnerInChannel = async (
  cohort_breakout_id,
  email,
  attendedTime,
) => {
  try {
    const cohortBreakout = await getCohortBreakoutById(cohort_breakout_id);
    const {
      cohort_id, details,
    } = cohortBreakout;
    let slackUserResponse = await web.users.lookupByEmail({ email });
    let slackUserId = slackUserResponse.user.id;
    let text = ATTENDANCE_TEMPLATE(slackUserId, details.topics, attendedTime);
    const channel_id = await getChannelIdForCohort(cohort_id);
    const updatedText = (cohort_id) ? `${text}` : text;
    await postMessage({ channel: channel_id, text: updatedText });
    return true;
  } catch (err) {
    logger.error(`Error while sending attendance status to slack: ${err}`);
    return false;
  }
};

export const notifyLearnersInChannel = async (req, res) => {
  let {
    learner_id, text, cohort_id, type, team_number,
  } = req.body;
  let email;
  if (learner_id) {
    let learner = await getProfile(learner_id);
    email = learner.email;
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
    // logger.info(channel_id);
    if (!text) {
      switch (type) {
        case 'reviews':
          if ((learner_id) && (slackUserId)) {
            text = LEARNER_REVIEW_TEMPLATE(slackUserId);
            break;
          }
          text = REVIEW_TEMPLATE(team_number);
          break;
        case 'assessment':
          text = ASSESSMENT_TEMPLATE(slackUserId);
          break;
        case 'lecture':
          text = (learner_id) ? LEARNER_BREAKOUT_TEMPLATE(slackUserId) : BREAKOUT_TEMPLATE;
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
    logger.error(err);
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

export const postTodaysBreakouts = async (todaysBreakouts) => {
  const postOnChannel = async (channelId, textBody) => {
    const today = new Date();
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
      const slackResponse = await postMessage({
        channel: channelId,
        blocks: [
          {
            type: 'context',
            elements: [{
              type: 'mrkdwn',
              text: `<!channel> Sessions scheduled for today, i.e., *${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}*`,
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
      logger.error(err);
      logger.error(`Failed to post on slack channel ${channelId} and breakout text: ${textBody}`);
      return false;
    }
  };
  let data = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [cohort_id, breakout_types] of Object.entries(todaysBreakouts)) {
    const channelId = await getChannelIdForCohort(cohort_id);
    let breakout_text = '';
    // let b_type;
    let b_topic;

    // eslint-disable-next-line no-restricted-syntax
    for (const [type, breakouts] of Object.entries(breakout_types)) {
      switch (type) {
        case 'lecture':
          // b_type = (breakout.details.type === 'tep') ? 'Tech Breakouts' : 'MindCasts';
          b_topic = breakouts.map(b => b.topics).join('\n');
          breakout_text += `${b_topic}`;
          break;
        case 'reviews':
          // b_type = 'Reviews';
          b_topic = `${breakouts.map(b => b.topics).join('\n')}`;
          breakout_text += b_topic;
          break;
        case 'assessment':
          b_topic = `${breakouts.map(b => b.topics).join('\n')}`;
          breakout_text += b_topic;
          break;
        // no default
      }
    }
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await postOnChannel(channelId, breakout_text);
      data.push(res);
    } catch (err) {
      data.push({
        text: 'failed to postOnChannel',
      });
    }
  }
  return data;
};

