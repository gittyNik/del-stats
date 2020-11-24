import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid/v4';
import request from 'superagent';
import Redis from 'ioredis';
import db from '../database';
import { Cohort, getCohortIdFromLearnerId, getCohortFromId } from './cohort';
import { SocialConnection } from './social_connection';
import { User, getProfile } from './user';
import web from '../integrations/slack/delta-app/client';
import { logger } from '../util/logger';

export const SlackChannel = db.define('slack_channels', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: 'cohorts' },
    unique: true,
    allowNull: false,
  },
  channels: Sequelize.ARRAY({
    type: Sequelize.STRING,
    allowNUll: false,
  }),
});

export const createSlackChannelRow = (cohort_id, channelId) => SlackChannel
  .create({
    id: uuid(),
    cohort_id,
    channels: [channelId],
  })
  .then(data =>
    // console.log(data.toJSON());
    data.toJSON());

export const getChannelIdForCohort = (cohort_id) => SlackChannel
  .findOne({ attributes: ['channels'], where: { cohort_id }, raw: true })
  .then(data =>
    // console.log(data.channels);
    data.channels[0]);

const getChannelName = async (cohort_id) => {
  const cohort = await Cohort.findByPk(cohort_id);

  let location = cohort.location.split(' ');
  location = location.length > 1 ? location[location.length - 1].slice(0, 3) : location[0].slice(0, 3);

  let { start_date, duration } = cohort;
  switch (duration) {
    case 16:
      duration = 'ft';
      break;
    case 26:
      duration = 'pt';
      break;
    default:
      console.error('Cohort duration need to be 16 or 26');
  }
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];
  const cohortName = cohort.name.toLowerCase();
  const locationName = location.toLowerCase();
  const year = start_date.getFullYear();
  const month = monthNames[start_date.getMonth()];
  const cohortType = cohort.type.toLowerCase();
  if (cohortType === 'remote') {
    return `${cohortName}-${cohortType}-${duration}-${month}-${year}`;
  }
  return `${cohortName}-${locationName}-${duration}-${month}-${year}`;
};

// currently not working due to irregularities.
export const getEducatorsSlackID = async () => {
  const { SLACK_DELTA_ADMIN_TOKEN, SLACK_DELTA_BOT_TOKEN } = process.env;
  let channelId = 'G9N2850DU'; // educator channel in SOAL.
  let listMembers = await request
    .get('https://slack.com/api/conversations.members')
    .query(`channel=${channelId}`)
    .set('Authorization', `Bearer ${SLACK_DELTA_ADMIN_TOKEN}`);
  // console.log(listMembers.body.members);
  listMembers = listMembers.body.members;
  let emailList = listMembers.map(async (member) => {
    let userInfo = await request
      .get('https://slack.com/api/users.info')
      .query(`user=${member}`)
      .set('Authorization', `Bearer ${SLACK_DELTA_ADMIN_TOKEN}`);
    // console.log(userInfo);
    return userInfo.body.user.profile.email;
  });

  emailList = await Promise.all(emailList);

  let userIdSPE = emailList.map(async (email) => {
    let res = await request
      .get('https://slack.com/api/users.lookupByEmail')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .query(`email=${email}`);
    // console.log(res.body);
    if (res.body.ok) {
      return res.body.user.id;
    }
    return `Error ${email}`;
  });
  return Promise.all(userIdSPE);
};

export const getTeamSlackIDs = async () => {
  // const redis = new Redis(process.env.REDIS_URL);
  // const list = await redis.lrange('teamSlackIds', 0, -1);
  // #soal-team slack channel ID in soal-spe
  const channel_id = 'C01ELB0DB7W';
  // delta bot user id
  const delta_id = 'UQK32AAKU';
  let list;
  try {
    list = await web.conversations.members({
      channel: channel_id,
    })
      .then(data => data.members.filter(m => m !== delta_id)); // removing delta Id from list.
  } catch (err) {
    logger.error(err);
  }
  return list;
};

export const getLearnerSlackIds = async (cohort_id) => {
  const cohort = await Cohort.findByPk(cohort_id);
  // console.log(cohort.learners);
  let learnerIds = await Promise.all(cohort.learners.map(async (user_id) => {
    try {
      let social = await SocialConnection
        .findOne({
          attributes: ['id', 'provider', 'username', 'email'],
          where: {
            user_id,
            provider: { [Op.startsWith]: 'slack' },
          },
          raw: true,
        });
      return {
        username: social.username,
      };
    } catch (error) {
      // console.log('Hello', error);
      return { notRegistered: user_id };
    }
  }));
  return learnerIds;
};

// tobe called in beginCohortWithId
export const createChannel = async (cohort_id) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  const channelName = await getChannelName(cohort_id);
  // console.log(channelName);
  let emptyChannel = await request
    .post('https://slack.com/api/conversations.create')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .send({
      name: channelName,
      is_private: true,
      // user_ids: 'UQTS58D6K',
    });
  const { ok, channel } = emptyChannel.body;
  if (ok) {
    // get list of all slackIDS - both team and learers
    const teamIds = await getTeamSlackIDs();
    let learners = await getLearnerSlackIds(cohort_id);
    let learnerIds = learners.filter(learner => learner.username);
    learnerIds = learnerIds.map(l => l.username);
    let notRegistered = learners.filter(learner => learner.notRegisted);

    let userIds = [...teamIds, ...learnerIds];

    // todo: check all userIds are valid ? invite all: invite only valid.

    // invite team and learners to newly created slack channel.
    const channelWithTeam = await request
      .post('https://slack.com/api/conversations.invite')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .send({
        channel: channel.id,
        users: userIds.join(','),
      });
    if (channelWithTeam.body.ok) {
      return {
        text: 'Team and learners invited to the newly created slack channel',
        notRegistered,
        added: userIds,
        channel: channelWithTeam.body.channel,
      };
    }
    // console.log(channelWithTeam.body);
    return {
      text: 'Channel created and error in inviting',
      channel: emptyChannel.body,
      userIds,
      notRegistered,
      error: channelWithTeam.body,
    };
  }
  return emptyChannel.body;
};

// channelId :  channel Id's
// learnersId : Array of slackLearner Id's
export const addLearnerToAChannel = async (channelId, learnerIds) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  const channel = await request
    .post('https://slack.com/api/conversations.invite')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .send({
      channel: channelId,
      users: learnerIds.join(','),
    });
  let data = {};
  if (channel.body.ok) {
    data.channelObject = channel.body.channel;
    return data;
  }
  data.error = channel.body.error;
  return data;
};

export const addLearnerToChannels = async (cohort_id, learnerSlackID) => {
  const slackChannels = await SlackChannel
    .findOne({
      where: { cohort_id },
      raw: true,
    });
  let { channels } = slackChannels;
  let channelResponses = await channels.map(async (channelId) => addLearnerToAChannel(channelId, learnerSlackID));
  return channelResponses;
};

export const getSlackIdsFromEmails = async (emailIds) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  const slackId = async (emailId) => {
    try {
      const response = await request
        .post('https://slack.com/api/users.lookupByEmail')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
        .send({
          email: emailId,
        });
      let { ok, user } = response.body;
      if (ok) return user.id;
      return {
        text: `Error finding slackId for ${emailId}`,
        body: response.body,
        email: emailId,
      };
    } catch (error) {
      console.error(error);
      return {
        text: `Error with ${emailId}`,
        email: emailId,
      };
    }
  };
  let slackIds = await Promise.all(emailIds.map(email => slackId(email)));
  // console.log(slackIds);
  return slackIds;
};

// paramets: cohort_id and arary of user_ids
export const addLearnersToCohortChannel = async (cohort_id, learners) => {
  const emails = await Promise.all(learners.map(learner => getProfile(learner)
    .then(user => user.email)));
  const learnerSlackIds = await getSlackIdsFromEmails(emails);
  const result = await addLearnerToChannels(cohort_id, learnerSlackIds);
  return result;
};

const createChannelFromSlackIds = async (cohort_id, channelName, slackIds) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  let emptyChannel = await request
    .post('https://slack.com/api/conversations.create')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .send({
      name: channelName,
      is_private: true,
    });
  const { ok: ok1, channel: channel1 } = emptyChannel.body;
  if (ok1) {
    // add a row in slack_channels table
    createSlackChannelRow(cohort_id, channel1.id);
    const channel2 = await request
      .post('https://slack.com/api/conversations.invite')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .send({
        channel: channel1.id,
        users: slackIds.join(','),
      });
    const { ok, channel } = channel2.body;
    if (ok) {
      return {
        text: `Slack channel ${channel.id} created. Team and Learners are added`,
        users_added: slackIds,
        channel,
      };
    }
    console.error(channel);
    return {
      text: 'Channel created but failed to invite users.',
      slackIds,
      channel,
    };
  }
  if (emptyChannel.body.error === 'name_taken') {
    const cid = await getChannelIdForCohort(cohort_id);
    const inviteUsers = await Promise.all(slackIds.map(async (l) => {
      const invite = await request
        .post('https://slack.com/api/conversations.invite')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
        .send({
          channel: cid,
          users: l,
        });
      if (invite.body.ok) {
        return `${l} added to channel`;
      }
      if (invite.body.error === 'already_in_channel') {
        return `${l} already in channel`;
      }
      return {
        text: `error inviting ${l}`,
        data: invite.body.error,
      };
    }));
    return inviteUsers;
  }
  return {
    text: 'Failed to create empty slack channel',
    error: emptyChannel.body,
  };
};

export const beginChannel = async (cohort_id, emailList) => {
  const channelName = await getChannelName(cohort_id);
  const teamIds = await getTeamSlackIDs();
  const learnerIds = await getSlackIdsFromEmails(emailList);
  const notSlackUser = learnerIds.filter(l => l.text);
  const slackUser = learnerIds.filter(l => !l.text);

  const channel = await createChannelFromSlackIds(cohort_id, channelName, [...teamIds, ...slackUser]);
  // console.log(JSON.stringify(channel, null, 2));
  return {
    text: 'Creating slack channel, inviting soal team and learners',
    data: {
      channelName,
      teamIds,
      slackUser,
      notSlackUser,
      channel, // main data
    },
  };
};

export const getSlackIdForLearner = async (learner_id) => {
  const learner = await User
    .findByPk(learner_id)
    .then(_learner => _learner.get({ plain: true }))
    .catch(err => {
      logger.error('Failed to get user email id');
      logger.error(err);
    });
  const { email } = learner;
  const slackId = await getSlackIdsFromEmails([email]);
  logger.info(slackId[0]);
  return slackId[0];
};

export const getSlackIdsForUsersInSPE = async (user_ids) => {
  const user_emails = await User
    .findAll({
      where: {
        id: {
          [Op.in]: user_ids,
        },
      },
      raw: true,
    })
    .then(_users => _users.map(u => u.email));
  let slackIds = await getSlackIdsFromEmails(user_emails);
  let slackUsers = slackIds.map(slackUser => {
    if (typeof slackUser === 'object' && slackUser !== null) {
      return slackUser.email;
    }
    return slackUser;
  });
  return slackUsers;
};

export const removeLearnerFromSlackChannel = async (learner_id, cohort_id) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  const slackId = await getSlackIdForLearner(learner_id);
  logger.info(slackId);

  const slackChannel = await SlackChannel
    .findOne({
      where: {
        cohort_id,
      },
    })
    .then(sc => sc.get({ plain: true }))
    .then(sc => sc.channels[0])
    .catch(err => {
      logger.error(err);
      return false;
    });
  if (slackChannel) {
    const res = await request
      .post('https://slack.com/api/conversations.kick')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .send({
        channel: slackChannel,
        user: slackId,
      });
    const { ok, error } = res.body;
    if (ok) {
      logger.info(`Learner: ${learner_id} removed from slackChannel ${slackChannel}`);
      return true;
    }
    logger.error(error);
    return false;
  }
  logger.error(`Error finding slack channel for cohort_id: ${cohort_id}`);
  return false;
};

export const moveLearnerToNewSlackChannel = async (
  learner_id, current_cohort_id, new_cohort_id,
) => {
  try {
    const slackId = await getSlackIdForLearner(learner_id);
    const newSlackChannelId = await getChannelIdForCohort(new_cohort_id);
    await removeLearnerFromSlackChannel(learner_id, current_cohort_id);
    await addLearnerToAChannel(newSlackChannelId, [slackId]);
    return `Successfully moved learner ${learner_id} to ${new_cohort_id}`;
  } catch (err) {
    logger.error(err);
    return `Failed to move learner: ${learner_id} to another cohort slack channel: ${new_cohort_id}`;
  }
};

export const addLearnersToDSAChannels = async (cohort_id) => {
  const cohort = await getCohortFromId(cohort_id).then(c => c.get({ plain: true }));
  const { duration, learners } = cohort;
  let slack_channel_id;
  switch (duration) {
    case 16:
      slack_channel_id = process.env.SLACK_SPE_DS_ALGO_FT_CHANNEL;
      break;
    case 26:
      slack_channel_id = process.env.SLACK_SPE_DS_ALGO_PT_CHANNEL;
      break;
    default:
      return {
        err: 'Invalid duration for cohort',
      };
  }
  const emails = await Promise.all(learners.map(async learner => getProfile(learner)
    .then(data => data.get({ plain: true }))
    .then(d => d.email)));
  let slackIds = await getSlackIdsFromEmails(emails);
  let temp = slackIds
    .filter(id => typeof id === 'object')
    .map(_id => _id.email);
  slackIds = slackIds.filter(id => typeof id === 'string');
  try {
    const data = await addLearnerToAChannel(slack_channel_id, slackIds);
    return {
      slack_channel_id,
      learner_not_added: temp,
      data,
    };
  } catch (err) {
    console.error(err);
    return {
      slack_channel_id,
      learner_not_added: temp,
      err,
    };
  }
};
