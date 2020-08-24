import request from 'superagent';
import { WebClient } from '@slack/web-api';
import { composeHome } from '../views/home.view';
import { getLiveCohorts } from '../../../../models/cohort';

const { SLACK_DELTA_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_DELTA_BOT_TOKEN);

export const publishHome = user_id => getLiveCohorts()
  .then(composeHome)
  .then(view => {
    // console.log(JSON.stringify(view));
    web.views.publish({
      view,
      user_id,
    });
  });

export const publishWelcome = user_id => {
  console.log('publishing welcome message', user_id);
};

// scopes: channels:manage
export const createChannel = async (channel_name, user_ids) => {
  // console.log('channel Created. ', channel_name);
  let response = await request
    .post('https://slack.com/api/conversations.create')
    .set('content-type', 'application/json')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .send({
      name: channel_name,
      is_private: true,
      user_ids: user_ids.join(','),
    });
  if (response.body.ok) {
    return {
      channel_id: response.body.channel.id,
      channe_name: response.body.channel.name,
    };
  }
  return response.body;
};

// scope channel:manage
// users: A comma separated list of Slack user IDs
export const inviteUsersToChannel = async (channelID, users) => {
  let response = await request
    .post('https://slack.com/api/conversations.invite')
    .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
    .set('content-type', 'application/json')
    .send({
      channel: channelID,
      users: users.join(', '),
    });
  if (response.body.ok) {
    return response.body.channel;
  }
  return response.body;
};

// invite a user to workspace - spe.
export const inviteToSlackSPE = async (emailList) => Promise.all(emailList.map(async (email) => {
  try {
    let response = await request
      .post('https://slack.com/api/admin.users.invite')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({
        channel_ids: '',
        email: '',
        team_id: '', // team_id or workspace_id.
        guest_expiration_ts: '',
        is_restricted: false, // default false
        real_name: '',
        resend: true,
      });
    if (response.body.ok === true) {
      return `${email} : OK`;
    }
    console.error(response.body);
    return `${email}: Failed`;
  } catch (e) {
    console.error(e);
    return `Failed to send invite to ${email}`;
  }
}));
