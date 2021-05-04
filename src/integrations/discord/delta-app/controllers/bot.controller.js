/* eslint-disable no-await-in-loop */
import Discord from 'discord.js';
import client from '../client';
import { getCohortBreakoutById } from '../../../../models/cohort_breakout';
import { getChannelForCohort } from './channel.controller';
import { getDiscordUserIdsByDeltaUserIds } from './user.controller';
import { getGuildIdFromCohort } from './guild.controller';
import { findRole } from './role.controller';
import { getCohortIdFromLearnerId, getLearnersFromCohorts } from '../../../../models/cohort';
import {
  SETUP_CHANNELS, WELCOME_MESSAGES, REVIEW_TEMPLATE, LEARNER_REVIEW_TEMPLATE, ASSESSMENT_TEMPLATE,
  BREAKOUT_TEMPLATE, LEARNER_BREAKOUT_TEMPLATE, QUESTIONAIRE_TEMPLATE, ATTENDANCE_TEMPLATE, SETUP_ROLES,
  ASSESSMENT_MESSAGE_TEMPLATE,
} from '../config';
import { getLearnerBreakoutsForACohortBreakout } from '../../../../models/learner_breakout';
import logger from '../../../../util/logger';
import {
  getRubricsByMilestone,
} from '../../../../models/rubrics';
import {
  getWeekDay,
} from '../../../../util/utility';

export const sendMessage = ({ channelId, msg }) => client.channels.get(channelId).send(msg);

export const sendReact = ({ message, reaction }) => message.react(reaction);
export const deleteMessage = ({ message, reaction }) => message.delete(reaction);

export const welcomeMember = async ({ member }) => {
  const channel = await member.guild.channels.cache.filter(ch => ch.name === SETUP_CHANNELS[0].data.public[1].channels[0]);
  if (!channel) throw new Error('Invalid Channel! welcomeMember');

  return channel.send(`${member} ${WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]}`);
};

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
  const channel = await getChannelForCohort({ cohort_id });
  let text = ASSESSMENT_MESSAGE_TEMPLATE(channel, phase, date, currentDay, topicsString);

  return channel.send(text);
};

export const notifyAttendanceLearnerInChannel = async (
  cohort_breakout_id,
  user_id,
  attendedTime,
) => {
  try {
    const cohortBreakout = await getCohortBreakoutById(cohort_breakout_id);
    const {
      cohort_id, details,
    } = cohortBreakout;

    let discordUserId = await getDiscordUserIdsByDeltaUserIds({ user_ids: [user_id] });

    let text = ATTENDANCE_TEMPLATE(discordUserId[0], details.topics, attendedTime);
    const channel = await getChannelForCohort({ cohort_id });
    const updatedText = (cohort_id) ? `${text}` : text;

    channel.send(updatedText);
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

  let discordUserId;
  try {
    if (learner_id) {
      discordUserId = await getDiscordUserIdsByDeltaUserIds({ user_ids: [learner_id] });
    }
    if (typeof cohort_id === 'undefined') {
      cohort_id = await getCohortIdFromLearnerId(learner_id);
    }
    const channel = await getChannelForCohort({ cohort_id });
    // logger.info(channel.id);
    if (!text) {
      switch (type) {
        case 'reviews':
          if ((learner_id) && (discordUserId)) {
            text = LEARNER_REVIEW_TEMPLATE(discordUserId[0]);
            break;
          }
          text = REVIEW_TEMPLATE(team_number);
          break;
        case 'assessment':
          text = ASSESSMENT_TEMPLATE(discordUserId[0]);
          break;
        case 'lecture':
          text = (learner_id) ? LEARNER_BREAKOUT_TEMPLATE(discordUserId[0]) : BREAKOUT_TEMPLATE;
          break;
        case 'question_hour':
          text = QUESTIONAIRE_TEMPLATE;
          break;
        // no default
      }
    }

    const guild_id = await getGuildIdFromCohort({ cohort_id });
    const sailor = await findRole({ guild_id, name: SETUP_ROLES[2].name });

    const updatedText = (req.body.cohort_id) ? `${sailor} ${text}` : text;

    const post_res = await channel.send(updatedText);
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
      text: 'Failed to notify on the Discord channel',
    });
  }
};

export const postAttendaceInCohortChannel = async (cohort_breakout_id) => {
  logger.info('Posting Attendance');
  try {
    const cohortBreakout = await getCohortBreakoutById(cohort_breakout_id);
    const {
      type, cohort_id, catalyst_id, details,
    } = cohortBreakout;
    const cohortDiscordChannel = await getChannelForCohort({ cohort_id });

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

    let discordIdsOfAttendedLearners = await getDiscordUserIdsByDeltaUserIds({ user_ids: attendedLearners });
    let discordIdsOfAbsentLearners = await getDiscordUserIdsByDeltaUserIds({ user_ids: absentLearners });

    let title;

    if (type === 'lecture') {
      const discordIdOfCatalyst = await getDiscordUserIdsByDeltaUserIds({ user_ids: [catalyst_id] });
      title = `Attendance record for *<@${discordIdOfCatalyst}>*'s breakout on \n${details.topics}`;
    } if (type === 'reviews') {
      title = `Attendance of ${details.topics}`;
    }
    if (type === 'assessment') {
      title = `Attendance of ${details.topics}`;
    }

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(title)
      .setURL('https://delta.soal.io/')
      .addFields([
        { name: '***PRESENT***:', value: `${discordIdsOfAttendedLearners.map(l => `>>><@${l}>`).join('\n')} `, inline: true },
        { name: '***ABSENT***:', value: `${discordIdsOfAbsentLearners.map(l => `>>><@${l}>`).join('\n')} `, inline: true },
      ])
      .setTimestamp()
      .setFooter('If any above Learner has been marked incorrectly, let us know!');

    const discordMessageResponse = await cohortDiscordChannel.send(embed);

    return discordMessageResponse;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

export const postTodaysBreakouts = async (todaysBreakouts) => {
  const postOnChannel = async ({ channel, breakout_text }) => {
    const today = new Date();
    const startWith = `Sessions scheduled for today i.e., **${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}**`;

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(startWith)
      .setURL('https://delta.soal.io/')
      .addFields([
        { name: 'Topics', value: breakout_text },
        { name: '\u200B', value: `${channel.toString()}` },
      ])
      .setTimestamp()
      .setFooter('Any changes to the above will be updated only on Delta Web - please keep an eye out.', 'https://coursereport-s3-production.global.ssl.fastly.net/uploads/school/logo/450/original/SOAL_SYMBOL-05.png');

    try {
      const discordResponse = await channel.send(embed);
      return discordResponse;
    } catch (err) {
      logger.error(err);
      logger.error(`Failed to post on discord channel ${channel.id} and breakout text: ${breakout_text}`);
      return false;
    }
  };

  let data = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [cohort_id, breakout_types] of Object.entries(todaysBreakouts)) {
    const channel = await getChannelForCohort({ cohort_id });
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

      const res = await postOnChannel({ channel, breakout_text });
      data.push(res);
    } catch (err) {
      data.push({
        text: 'failed to postOnChannel',
      });
    }
  }
  return true;
};
