import { WebClient } from '@slack/web-api';
import { composeHome } from '../views/home.view';
import { getLiveCohorts } from '../../../../models/cohort';

const { SLACK_DELTA_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_DELTA_BOT_TOKEN);

export const publishHome = user_id => getLiveCohorts()
  .then(composeHome)
  .then(view => {
    console.log(JSON.stringify(view));
    web.views.publish({
      view,
      user_id,
    });
  });

export const publishWelcome = user_id => {
  console.log('publishing welcome message', user_id);
};
