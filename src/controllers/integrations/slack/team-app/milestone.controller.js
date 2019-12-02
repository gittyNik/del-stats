import { WebClient } from '@slack/web-api';
import { getCurrentMilestoneOfCohort } from '../../../../models/cohort_milestone';
import { composeMilestoneModal } from './milestone.view';

const { SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);

export const showMilestoneDetails = (cohort_id, trigger_id) => {
  getCurrentMilestoneOfCohort(cohort_id)
    .then(milestone => {
      console.log(milestone);
      const view = composeMilestoneModal(milestone);
      console.log(JSON.stringify(view));
      return web.views.open({
        view,
        trigger_id,
      });
    }).catch(err => console.log(err));
};
