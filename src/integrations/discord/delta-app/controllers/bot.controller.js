import Discord from 'discord.js';
import client from '../client';
import { getTopicNameById } from '../../../../models/topic';
import { getCohortBreakoutById } from '../../../../models/cohort_breakout';
import { getChannelForCohort } from './channel.controller';
import { getDiscordUserIdsByDeltaUserIdsOrEmails } from './user.controller';
import { getGuildIdFromCohort, getGuild } from './guild.controller';
import { findRole } from './role.controller';
import { getCohortIdFromLearnerId, getLearnersFromCohorts } from '../../../../models/cohort';
import {
  WELCOME_MESSAGES, REVIEW_TEMPLATE, LEARNER_REVIEW_TEMPLATE, ASSESSMENT_TEMPLATE,
  BREAKOUT_TEMPLATE, LEARNER_BREAKOUT_TEMPLATE, QUESTIONAIRE_TEMPLATE, ATTENDANCE_TEMPLATE, SETUP_ROLES,
  ASSESSMENT_MESSAGE_TEMPLATE, EMBED_MESSAGE_LOGO, EMBED_MESSAGE_URL,
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
  const guild = await getGuild({ guild_id: member.guild.id });

  const channel = await guild.channels.cache.find(ch => ch.name.includes('welcome'));

  if (!channel) throw new Error('Invalid Channel! welcomeMember');
  await channel.send(`${member} ${WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]}`);

  return true;
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

  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(text.title)
    .setURL(EMBED_MESSAGE_URL)
    .addFields(text.fields)
    .setTimestamp()
    .setFooter(text.footer, EMBED_MESSAGE_LOGO);

  return channel.send(embed);
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

    let discordId = await getDiscordUserIdsByDeltaUserIdsOrEmails({ user_ids: [user_id] });

    let text = ATTENDANCE_TEMPLATE(discordId, details.topics, attendedTime);
    const channel = await getChannelForCohort({ cohort_id });
    const updatedText = (cohort_id) ? `${text}` : text;

    channel.send(updatedText);
    return true;
  } catch (error) {
    logger.error(`Error while sending attendance status to slack: ${error}`);
    return false;
  }
};

export const notifyLearnersInChannel = async (req, res) => {
  let {
    learner_id, text, cohort_id, type, team_number,
  } = req.body;

  let discord_user_ids;
  let discord_user_id;
  try {
    if (learner_id) {
      discord_user_ids = await getDiscordUserIdsByDeltaUserIdsOrEmails({ user_ids: [learner_id] });

      if (discord_user_ids.length > 0) {
        [discord_user_id] = discord_user_ids;
      }
    }
    if (typeof cohort_id === 'undefined') {
      cohort_id = await getCohortIdFromLearnerId(learner_id);
    }
    const channel = await getChannelForCohort({ cohort_id });

    if (!text) {
      switch (type) {
        case 'reviews':
          if ((learner_id) && (discord_user_id)) {
            text = LEARNER_REVIEW_TEMPLATE(discord_user_id);
            break;
          }
          text = REVIEW_TEMPLATE(team_number);
          break;
        case 'assessment':
          text = ASSESSMENT_TEMPLATE(discord_user_id);
          break;
        case 'lecture':
          text = (learner_id) ? LEARNER_BREAKOUT_TEMPLATE(discord_user_id) : BREAKOUT_TEMPLATE;
          break;
        case 'question_hour':
          text = QUESTIONAIRE_TEMPLATE;
          break;
        // no default
      }
    }

    const guild_id = await getGuildIdFromCohort({ cohort_id });
    const sailor = await findRole({ guild_id, name: SETUP_ROLES[2].name });

    const updatedText = (cohort_id) ? `${sailor} ${text}` : text;

    const post_res = await channel.send(updatedText);
    return res.status(200).json({
      text: 'Message posted on the channel',
      data: {
        channel: post_res.channel,
        ts: post_res.ts,
        message: post_res.message,
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      text: 'Failed to notify on the Discord channel',
    });
  }
};

export const postAttendaceInCohortChannel = async (cohort_breakout_id) => {
  try {
    logger.info('Posting Attendance');
    const cohortBreakout = await getCohortBreakoutById(cohort_breakout_id);
    const topic_ids = cohortBreakout['breakout_template.topic_id'];

    let topic_titles = await Promise.all(topic_ids.map(topic_id => getTopicNameById(topic_id)));
    topic_titles = topic_titles.join('\n');
    const {
      type, cohort_id, catalyst_id, details,
    } = cohortBreakout;
    const cohortDiscordChannel = await getChannelForCohort({ cohort_id });

    if (cohortDiscordChannel) {
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

      let discordIdsOfAttendedLearners = await getDiscordUserIdsByDeltaUserIdsOrEmails({ user_ids: attendedLearners });
      let discordIdsOfAbsentLearners = await getDiscordUserIdsByDeltaUserIdsOrEmails({ user_ids: absentLearners });

      let title;

      if (type === 'lecture') {
        const discordIdOfCatalyst = await getDiscordUserIdsByDeltaUserIdsOrEmails({ user_ids: [catalyst_id] });
        title = `Attendance record for *<@${discordIdOfCatalyst[0]}>*'s breakout on \n${topic_titles}`;
      } if (type === 'reviews') {
        title = `Attendance of ${details.topics}`;
      } if (type === 'assessment') {
        title = `Attendance of ${details.topics}`;
      }

      const presentLearnersText = `${discordIdsOfAttendedLearners.map(l => `<@${l}>`).join('\n')} `;
      const absentLearnersText = `${discordIdsOfAbsentLearners.map(l => `<@${l}>`).join('\n')} `;

      let fields = [];

      if (presentLearnersText !== '') {
        fields.push(
          { name: '***PRESENT***:', value: presentLearnersText, inline: true },
        );
      } if (absentLearnersText !== '') {
        fields.push(
          { name: '***ABSENT***:', value: absentLearnersText, inline: true },
        );
      }

      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setURL(EMBED_MESSAGE_URL)
        .addFields(fields)
        .setTimestamp()
        .setFooter('If any above Learner has been marked incorrectly, let us know!');

      const discordMessageResponse = await cohortDiscordChannel.send(embed);

      return discordMessageResponse;
    }
    return false;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

const postOnChannel = async ({ channel, breakout_text }) => {
  const today = new Date();
  const startWith = `Sessions scheduled for today i.e., **${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}**`;

  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(startWith)
    .setURL(EMBED_MESSAGE_URL)
    .addFields([
      { name: 'Topics', value: breakout_text },
      { name: '\u200B', value: `${channel.toString()}` },
    ])
    .setTimestamp()
    .setFooter('Any changes to the above will be updated only on Delta Web - please keep an eye out.', EMBED_MESSAGE_LOGO);

  try {
    const discordResponse = await channel.send(embed);
    return discordResponse;
  } catch (error) {
    logger.error(error);
    logger.error(`Failed to post on discord channel ${channel.id} and breakout text: ${breakout_text}`);
    return false;
  }
};

export const postTodaysBreakouts = async (todaysBreakouts) => {
  await Promise.all(Object.entries(todaysBreakouts).map(
    async ([cohort_id, breakout_types]) => {
      const channel = await getChannelForCohort({ cohort_id });
      if (channel === undefined) return false;
      let breakout_text = '';

      let b_topic;
      Object.entries(breakout_types).map(async ([type, breakouts]) => {
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
      });
      await postOnChannel({ channel, breakout_text });
      return true;
    },
  ));
  return true;
};
