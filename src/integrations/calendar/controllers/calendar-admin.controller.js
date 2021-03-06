import { listEvents, createEvent } from '../calendar.model';
import { getGoogleOauthOfUser } from '../../../util/calendar-util';
import { CohortBreakout, getCalendarDetailsOfCohortBreakout } from '../../../models/cohort_breakout';
import { Cohort } from '../../../models/cohort';
import logger from '../../../util/logger';

export const getAllEvents = async (req, res) => {
  const { user } = req.jwtData;
  const oauth = await getGoogleOauthOfUser(user.id);
  const events = await listEvents(oauth);
  res.json(events);
};

const getCohortName = (cohort_breakout_id) => CohortBreakout
  .findByPk(cohort_breakout_id)
  .then(cohortBreakout => cohortBreakout.get({ plain: true }))
  .then(async cohortBreakout => {
    const { cohort_id } = cohortBreakout;
    return cohort_id;
  })
  .then(cohort_id => Cohort
    .findByPk(cohort_id)
    .then(cohort => cohort.get({ plain: true }))
    .then(cohort => cohort.name))
  .catch(err => {
    logger.error(err);
    return false;
  });

export const createEventForBreakout = async (req, res) => {
  const { cohort_breakout_id } = req.body;
  // logger.info(cohort_breakout_id);
  const event_detail = await getCalendarDetailsOfCohortBreakout(cohort_breakout_id);
  const cohortName = await getCohortName(cohort_breakout_id);
  event_detail.summary = `${cohortName} - ${event_detail.summary}`;
  res.json(event_detail);
};
