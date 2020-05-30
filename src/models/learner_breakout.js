import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort, getCohortFromLearnerId } from './cohort';
import { getScheduledCohortBreakoutsByCohortId, getCalendarDetailsOfCohortBreakout } from './cohort_breakout';
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
  attendance: Sequelize.BOOLEAN,
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

export const createCalendarEventsForLearner = async (learner_id) => {
  try {
    // console.log(learner_id);
    const oauth2 = await getGoogleOauthOfUser(learner_id);
    // console.log(oauth2);
    const cohort_id = await getCohortFromLearnerId(learner_id)
      .then(cohort => cohort.get({ plain: true }))
      .then(cohort => cohort.id);
    // console.log(cohort_id);

    const cohort_breakouts = await getScheduledCohortBreakoutsByCohortId(cohort_id);
    // console.log(cohort_breakouts);
    // return cohort_breakouts;
    const event_list = await Promise.all(cohort_breakouts.map(async cohort_breakout => {
      const event_body = await getCalendarDetailsOfCohortBreakout(cohort_breakout.id);
      // if learner breakout exists only then update the calendar.
      // check if learner breakout exists for that cohort_breakout.
      const lb = await LearnerBreakout
        .findOne({
          where: {
            cohort_breakout_id: cohort_breakout.id,
            learner_id,
          },
        })
        .then(_lb => _lb.get({ plain: true }))
        .catch(err => {
          console.error(err);
          return false;
        });
      if (lb) {
        const calendarEvent = await createEvent(oauth2, event_body);
        console.log(calendarEvent);
        const learner_breakout = await LearnerBreakout.update({
          review_feedback: calendarEvent,
        }, {
          where: {
            cohort_breakout_id: cohort_breakout.id,
            learner_id,
          },
          returning: true,
          raw: true,
        });
        return {
          learner_breakout_id: learner_breakout.id,
          cohort_breakout_id: cohort_breakout.id,
          event_created: calendarEvent,
          event_updated: learner_breakout.review_feedback,
        };
      }
      return {
        learner_breakout_id: 'Learner Breakout doesnt exist',
        cohort_breakout_id: cohort_breakout.id,
        evet_created: 'Learner Breakout doesnt exist',
      };
    }));
    console.log(`${cohort_breakouts.length} Cohort_breakouts `);
    console.log(`${event_list.length} Learner Breakouts updated with calendar events `);
    console.log(event_list);
    return `${event_list.length} out of ${cohort_breakouts.length} calendar events created`;
  } catch (err) {
    console.error(err);
    // return new Error('Failed to create calendar events for learner');
    return null;
  }
};

export default LearnerBreakout;
