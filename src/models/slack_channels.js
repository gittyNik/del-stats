import { Sequelize, Op } from 'sequelize';
import request from 'superagent';
import db from '../database';
import { Cohort } from './cohort';
import { SocialConnection } from './social_connection';
import Redis from 'ioredis';


export const SlackChannel = db.define('slack_channels', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: 'cohorts' },
  },
  channels: Sequelize.ARRAY({
    type: Sequelize.STRING,
    allowNUll: false,
  }),
});

const getChannelName = async (cohort_id) => {
  const cohort = await Cohort.findByPk(cohort_id);

  let location = cohort.location.split(' ');
  location = location.length > 1 ? location[location.length - 1].slice(0, 3) : location[0].slice(0, 3);

  let start_date = cohort.start_date;
  return `${cohort.name.toLowerCase()}-${location.toLowerCase()}-${start_date.getFullYear()}`
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
  const redis = new Redis(process.env.REDIS_URL);
  const res = await redis.lrange('teamSlackIds', 0, -1);
  return res;
};

export const getLearnerSlackIds = async (cohort_id) => {
  const cohort = await Cohort.findByPk(cohort_id);
  console.log(cohort.learners);
  let learnerIds = await Promise.all(cohort.learners.map(async (user_id) => {
    let social = await SocialConnection
      .findOne({
        attributes: ['id', 'provider', 'username', 'eamil'],
        where: {
          user_id,
          provider: { [Op.startsWith]: 'slack' },
        },
        raw: true,
      });
    return social.username;
  }));

  return learnerIds;
};

// tobe called in beginCohortWithId
export const createChannel = async (cohort_id) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  const channelName = await getChannelName(cohort_id);

  let emptyChannel = await request
    .post('https://slack.com/api/conversations.create')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .send({
      name: channelName,
      is_private: true,
    });
  const { ok, channel } = emptyChannel.body;
  if (ok) {
    // get list of all slackIDS - both team and learers
    const teamIds = await getTeamSlackIDs();
    const learnerIds = await getLearnerSlackIds();

    let userIds = [...teamIds, ...learnerIds];

    const channelWithTeam = await request
      .post('https://slack.com/api/conversations.invite')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .send({
        channel: channel.id,
        users: userIds.join(','),
      });
    if (channelWithTeam.body.ok) {
      return channelWithTeam.body.channel;
    }
    return emptyChannel.body;
  }
  return emptyChannel.body;
};


// channelId :  channel Id's
// learnersId : Array of slackLearner Id's
export const addLearnerToAChannel = async (channelId, learnerIds) => {
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
    .findAll({
      where: { cohort_id },
      raw: true,
    });
  let { channels } = slackChannels;
  let channelResponses = await channels.map(async (channelId) => {
    return addLearnerToAChannel(channelId, learnerSlackID);
  });
  // TODO: test whether learner is added to all the channels;
  return channelResponses;
};


// Need Enterprise grid account to enable this routes.
// works with user tooken. and scope: admin.users.write.
export const inviteLearnerToWorkspace = async (learnerEmail, channelIds, teamId) => {
  const { SLACK_DELTA_USER_TOKEN: token } = process.env;
  const invite = await request
    .post('https://slack.com/api/admin.users.invite')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({
      channel_ids: channelIds.join(','),
      email: learnerEmail,
      team_id: teamId,
      custom_message: '', // optionals
      resend: true,
    });
  let data = {};
  if (invite.body.ok) {
    data.text = 'Invite sent successfully';
    data.ok = true;
    return data;
  }
  data.error = invite.body;
  return data;
};
