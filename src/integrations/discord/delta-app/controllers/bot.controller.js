import Discord from 'discord.js';
import client from '../client';
import CohortBreakout, { getCohortBreakoutById } from '../../../../models/cohort_breakout';
import { findChannelByName, getChannelForCohort } from './channel.controller';
import { getDiscordUserIdsByDeltaUserIds } from './user.controller';
import { getSlackIdsForUsersInSPE } from '../../../../models/slack_channels';
import { Cohort, getCohortIdFromLearnerId, getLearnersFromCohorts } from '../../../../models/cohort';
import { SETUP_CHANNELS, WELCOME_MESSAGES } from '../config';
import { getLearnerBreakoutsForACohortBreakout } from '../../../../models/learner_breakout';
import logger from '../../../../util/logger';

// eslint-disable-next-line import/prefer-default-export

export const sendMessage = ({ channelId, msg }) => client.channels.get(channelId).send(msg);

export const sendReact = ({ message, reaction }) => message.react(reaction);
export const deleteMessage = ({ message, reaction }) => message.delete(reaction);

export const welcomeMember = async ({ member }) => {
  const channel = await member.guild.channels.cache.filter(ch => ch.name === SETUP_CHANNELS[0].data.public[1].channels[0]);
  if (!channel) throw new Error('Invalid Channel! welcomeMember');

  return channel.send(`${member} ${WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]}`);
};

export const postAttendaceInCohortChannel = async ({ cohort_breakout_id }) => {
  logger.info('Posting Attendance');
  try {
    const cohortBreakout = await getCohortBreakoutById(cohort_breakout_id);
    const {
      type, cohort_id, catalyst_id, details,
    } = cohortBreakout;
    const cohortDiscordChannel = await getChannelForCohort(cohort_id);

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
      const discordIdOfCatalyst = await getDiscordUserIdsByDeltaUserIds([catalyst_id]);
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
        { name: '***PRESENT***:', value: `${discordIdsOfAttendedLearners.map(l => `>>><@${l}>`).join('\n')}` },
        { name: '***ABSENT***:', value: `${discordIdsOfAbsentLearners.map(l => `>>><@${l}>`).join('\n')}` },
      ])
      .setTimestamp()
      .setFooter('If any above Learner has been marked incorrectly, let us know!');

    const discordMessageResponse = cohortDiscordChannel.send(embed);

    return discordMessageResponse;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

export const postTodaysBreakouts = async (todaysBreakouts) => {
  console.log(todaysBreakouts);
  // const postOnChannel = async (channelId, textBody) => {
  //   const today = new Date();
  //   const startWith = `<!channel> Sessions scheduled for today, i.e., *${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}*`;
  //   // find channel and send message
  //   const channel;

  //   const embed = new Discord.MessageEmbed()
  //     .setColor('#0099ff')
  //     .setTitle(startWith)
  //     .setURL('https://delta.soal.io/')
  //     .addFields([
  //       { name: 'Regular field title', value: 'Some value here' },
  //       { name: '\u200B', value: '\u200B' },
  //       { name: 'Inline field title', value: 'Some value here', inline: true },
  //       { name: 'Inline field title', value: 'Some value here', inline: true },
  //     ])
  //     .setTimestamp()
  //     .setFooter('Any changes to the above will be updated only on Delta Web - please keep an eye out.', 'https://coursereport-s3-production.global.ssl.fastly.net/uploads/school/logo/450/original/SOAL_SYMBOL-05.png');

  //   const text = textBody;

  //   const message = '';

  //   try {
  //     const discordResponse = await channel.send(embed);
  //     return discordResponse;
  //   } catch (err) {
  //     logger.error(err);
  //     logger.error(`Failed to post on discord channel ${channelId} and breakout text: ${textBody}`);
  //     return false;
  //   }
  // };

  // let data = [];
  // // eslint-disable-next-line no-restricted-syntax
  // for (const [cohort_id, breakout_types] of Object.entries(todaysBreakouts)) {
  //   const channelId = await getChannelIdForCohort(cohort_id);
  //   let breakout_text = '';
  //   // let b_type;
  //   let b_topic;

  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const [type, breakouts] of Object.entries(breakout_types)) {
  //     switch (type) {
  //       case 'lecture':
  //         // b_type = (breakout.details.type === 'tep') ? 'Tech Breakouts' : 'MindCasts';
  //         b_topic = breakouts.map(b => b.topics).join('\n');
  //         breakout_text += `${b_topic}`;
  //         break;
  //       case 'reviews':
  //         // b_type = 'Reviews';
  //         b_topic = `${breakouts.map(b => b.topics).join('\n')}`;
  //         breakout_text += b_topic;
  //         break;
  //       case 'assessment':
  //         b_topic = `${breakouts.map(b => b.topics).join('\n')}`;
  //         breakout_text += b_topic;
  //         break;
  //       // no default
  //     }
  //   }
  //   try {
  //     // eslint-disable-next-line no-await-in-loop
  //     const res = await postOnChannel(channelId, breakout_text);
  //     data.push(res);
  //   } catch (err) {
  //     data.push({
  //       text: 'failed to postOnChannel',
  //     });
  //   }
  // }
  return true;
};
