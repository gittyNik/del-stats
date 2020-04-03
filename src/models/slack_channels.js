import Sequelize from 'sequelize';
import request from 'superagent';
import db from '../database';
import { Cohort } from './cohort';


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

export const createChannel = async (cohort_id, userIds) => {
  const { SLACK_DELTA_BOT_TOKEN } = process.env;
  const channelName = await getChannelName(cohort_id);
  console.log(userIds.join(','));
  let emptyChannel = await request
    .post('https://slack.com/api/conversations.create')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .send({
      name: channelName,
      is_private: true,
      user_ids: userIds.join(','),
    });
  const { ok, channel } = emptyChannel.body;
  if (ok) {
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


// export const addLearnerToChannels = () => {

// }


// invite user to workspace.
// export const inviteLearnersToSpe = async(teamId, learnerList) =>{

// };
