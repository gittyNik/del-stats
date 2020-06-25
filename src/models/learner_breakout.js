import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import async from 'async';
import db from '../database';
import { Cohort, getCohortFromLearnerId } from './cohort';
import { getScheduledCohortBreakoutsByCohortId, getCalendarDetailsOfCohortBreakout, getCohortBreakoutsByCohortId } from './cohort_breakout';
import { createEvent } from '../integrations/calendar/calendar.model';
import { getGoogleOauthOfUser } from '../util/calendar-util';

export const LearnerBreakout = db.define('learner_breakouts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_breakout_id: {
    type: Sequelize.UUID,
    references: { model: 'cohort_breakouts', key: 'id' },
  },
  learner_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  learner_notes: Sequelize.TEXT,
  learner_feedback: Sequelize.TEXT,
  team_breakout_id: {
    type: Sequelize.UUID,
    references: { model: 'team_breakout', key: 'id' },
  },
  attendance: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  review_feedback: Sequelize.JSON,
});

// LearnerBreakout.addHook('afterCreate', 'createCalendarEvent', async (learner_breakout, options) => {
//   const learner_breakout_raw = learner_breakout.get({ plain: true });
//   // console.log(learner_breakout);
//   const { cohort_breakout_id, learner_id } = learner_breakout_raw;
//   try {
//     const event_body = await getCalendarDetailsOfCohortBreakout(cohort_breakout_id);
//     // console.log(event_body);
//     const oauth2 = await getGoogleOauthOfUser(learner_id);
//     const calendarEvent = await createEvent(oauth2, event_body);

//     learner_breakout.review_feedback = { calendarEvent };
//   } catch (err) {
//     console.error(err);
//   }
// });

// LearnerBreakout.addHook('afterUpdate', 'updateCalendarEvent', async (learner_breakout, options) => {
//   console.log('Learner Breakout updated');
//   console.log(learner_breakout.get({ plain: true }));
//   // todo: update calendar event.
// });

export const createLearnerBreakoutsForCohortMilestones = (
  cohort_breakout_id,
  cohort_id,
) => {
  console.log(cohort_breakout_id, cohort_id);
  return Cohort.findOne({
    attributes: ['id', 'learners'],
    where: {
      id: cohort_id,
    },
    raw: true,
  })
    .then((cohort) => {
      let learnerBreakouts = cohort.learners.map((learner) => {
        // console.log(learner, cohort_breakout_id);
        let learnerBreakout = LearnerBreakout.create({
          id: uuid(),
          cohort_breakout_id,
          learner_id: learner,
          attendance: false,
        })
          .then((data) => data.get({ plain: true }))
          .catch((err) => {
            console.error(err);
            return null;
          });
        return learnerBreakout;
      });
      console.log(
        `${learnerBreakouts.length} learner_breakouts created for a cohort_breakout_id: ${cohort_breakout_id}`,
      );
      return learnerBreakouts;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

export const removeLearnerBreakouts = (learner_id) => LearnerBreakout.destroy({
  where: {
    learner_id,
  },
});

export const createLearnerBreakouts = (learner_id,
  future_cohort_id) => getCohortBreakoutsByCohortId(future_cohort_id)
  .then((breakouts) => LearnerBreakout.bulkCreate(
    breakouts.map((breakout) => ({
      id: uuid(),
      learner_id,
      cohort_breakout_id: breakout.id,
      attendance: false,
    })),
  ));

export const getPayloadForCalendar = async (learnerId) => {
  try {
    const cohort_id = await getCohortFromLearnerId(learnerId)
      .then(cohort => cohort.get({ plain: true }))
      .then(cohort => cohort.id);
    // console.log(cohort_id);
    const cohortBreakouts = await getScheduledCohortBreakoutsByCohortId(cohort_id);
    // console.log(cohortBreakouts.length);
    const payload = await Promise.all(cohortBreakouts.map(async cohortBreakout => {
      const data = {};
      data.cohortBreakout = cohortBreakout;
      data.eventBody = await getCalendarDetailsOfCohortBreakout(cohortBreakout.id);
      data.learnerBreakout = await LearnerBreakout
        .findOne({
          where: {
            cohort_breakout_id: cohortBreakout.id,
            learner_id: learnerId,
          },
        })
        .then(_lb => _lb.get({ plain: true }))
        .catch(err => {
          console.error(`No learner breakout for ${cohortBreakout.id}`);
          return false;
        });
      return data;
    }));
    // console.log(payload);
    return payload;
  } catch (err) {
    console.error(err);
    return new Error(err);
  }
};

export const updateReviewFeedback = async (learner_breakout_id, calendarDetails) => {
  const learner_breakout = await LearnerBreakout
    .findOne({ where: { id: learner_breakout_id } })
    .then(_lb => _lb.get({ plain: true }))
    .catch(err => {
      console.error('Learner breakout doesnt exist');
      console.error(err);
    });
  const review_feedback = learner_breakout.review_feeback ? learner_breakout.review_feedback : {};
  review_feedback.calendarDetails = calendarDetails;

  // console.log(learner_breakout);
  const updatedLearnerBreakout = await LearnerBreakout
    .update({
      review_feedback,
    }, {
      where: {
        id: learner_breakout_id,
      },
      returning: true,
      raw: true,
    });
  return updatedLearnerBreakout;
};

export const createCalendarEventsForLearner = async (learnerId) => {
  const payload = await getPayloadForCalendar(learnerId);
  const oauth = await getGoogleOauthOfUser(learnerId);
  const res_data = [];
  return async.eachSeries(payload, (item, callback) => {
    if (item.learnerBreakout) {
      createEvent(oauth, item.eventBody)
        .then(event => {
          item.eventDetails = event;
          res_data.push(item);
          // console.log(item);
          return item;
        })
        .then(_item => updateReviewFeedback(_item.learnerBreakout.id, _item.eventDetails)
          .then((data) => {
            // console.log(data);
            callback();
          })
          .catch(err => {
            console.error(err);
            callback(err);
          }))
        .catch(err => {
          callback(err);
        });
    } else {
      callback();
    }
  })
    .then(() =>
      // console.log(res_data);
      res_data)
    .catch(err => {
      console.error(err);
      return false;
    });
};

export default LearnerBreakout;
