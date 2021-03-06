import web from '../client';
import { Cohort } from '../../../../models/cohort';
import { Topic } from '../../../../models/topic';
import { getCurrentMilestoneOfCohortDelta } from '../../../../models/cohort_milestone';
import { composeMilestoneModal, composeBreakoutMessage } from '../views/milestone.view';
import logger from '../../../../util/logger';

export const showMilestoneDetails = (payload, respond) => {
  const { trigger_id } = payload;
  const cohort_id = payload.actions[0].value;

  getCurrentMilestoneOfCohortDelta(cohort_id)
    .then(composeMilestoneModal)
    .then(view =>
      // logger.info(0);
      web.views.open({
        view,
        trigger_id,
      }))
    .catch(err => logger.error(err));
};

export const requestTopicBreakout = (payload, respond) => {
  const [topic_id, cohort_id] = payload.actions[0].value.split('.');
  const { username } = payload.user;
  const sendMessageToChannel = Promise.all([
    Topic.findByPk(topic_id),
    Cohort.findByPk(cohort_id),
  ])
    .then(([topic, cohort]) => composeBreakoutMessage({ topic, cohort, username }))
    .then(web.chat.postMessage);

  // TODO: schedule the breakout on database
  sendMessageToChannel()
    .catch(err => logger.error(err));
};
