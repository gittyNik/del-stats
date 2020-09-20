import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import async from 'async';
import _ from 'lodash';
import db from '../database';
import { Cohort, getCohortFromLearnerId } from './cohort';
import {
  CohortBreakout,
  getUpcomingBreakoutsByCohortId,
  getCalendarDetailsOfCohortBreakout,
  getCohortBreakoutsByCohortId,
} from './cohort_breakout';

import { createEvent, deleteEvent } from '../integrations/calendar/calendar.model';
import { getGoogleOauthOfUser } from '../util/calendar-util';
import { logger } from '../util/logger';

const { Op } = Sequelize;

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

// LearnerBreakout.addHook('afterCreate', 'createCalendarEvent',
// async (learner_breakout, options) => {
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

// LearnerBreakout.addHook('afterUpdate', 'updateCalendarEvent',
// async (learner_breakout, options) => {
//   console.log('Learner Breakout updated');
//   console.log(learner_breakout.get({ plain: true }));
//   // todo: update calendar event.
// });

export const createLearnerBreakoutsForCohortMilestones = (
  cohort_breakout_id,
  cohort_id,
) => Cohort.findOne({
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
      // console.log(
    //   `${learnerBreakouts.length} learner_breakouts created
    // for a cohort_breakout_id: ${ cohort_breakout_id }`,
      // );
    return learnerBreakouts;
  })
  .catch((err) => {
    console.error(err);
    return null;
  });

export const createLearnerBreakoutsForLearners = (
  cohort_breakout_id,
  learners,
) => learners.map((learner) => {
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

export const removeLearnerBreakouts = async (learner_id, current_cohort_id) => {
  const now = Sequelize.literal('NOW()');
  return db.query(
    `delete from learner_breakouts where id in (select l.id from learner_breakouts as l left join cohort_breakouts as c on l.cohort_breakout_id=c.id where l.learner_id in (\'${learner_id}\') and c.cohort_id=\'${current_cohort_id}\' and c.time_scheduled>\'${new Date(new Date()).toUTCString()}\')`,
  );

  // LearnerBreakout.destroy({
  //   where: {
  //     [Op.and]: {
  //       learner_id,

  //     },
  //   },
  // });
};

export const createLearnerBreakouts = (
  learner_id, future_cohort_id,
) => getCohortBreakoutsByCohortId(future_cohort_id)
  .then((breakouts) => LearnerBreakout.bulkCreate(breakouts.map((breakout) => ({
    id: uuid(),
    learner_id,
    cohort_breakout_id: breakout.id,
    attendance: false,
  }))));

export const getPayloadForCalendar = async (learnerId) => {
  try {
    const cohort_id = await getCohortFromLearnerId(learnerId)
      .then(cohort => cohort.get({ plain: true }))
      .then(cohort => cohort.id)
      .catch(err => {
        logger.error(err);
      });
    // console.log(cohort_id);
    const cohortBreakouts = await getUpcomingBreakoutsByCohortId(cohort_id);
    // console.log(cohortBreakouts.length);
    const payload = await Promise.all(
      cohortBreakouts.map(async (cohortBreakout) => {
        const data = {};
        data.cohortBreakout = cohortBreakout;
        data.eventBody = await getCalendarDetailsOfCohortBreakout(
          cohortBreakout.id,
        );
        data.learnerBreakout = await LearnerBreakout.findOne({
          where: {
            cohort_breakout_id: cohortBreakout.id,
            learner_id: learnerId,
          },
        })
          .then((_lb) => _lb.get({ plain: true }))
          .catch((err) => {
            console.error(`No learner breakout for ${cohortBreakout.id}`);
            return false;
          });
        return data;
      }),
    );
    // console.log(payload);
    return payload;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

// Add a property calendarDetails to review_feedback
export const updateReviewFeedback = async (learner_breakout_id, calendarDetails) => {
  const learner_breakout = await LearnerBreakout
    .findOne({ where: { id: learner_breakout_id } })
    .then(_lb => _lb.get({ plain: true }))
    .catch(err => {
      console.error('Learner breakout doesnt exist');
      console.error(err);
    });
  const review_feedback = learner_breakout.review_feeback
    ? learner_breakout.review_feedback
    : {};
  review_feedback.calendarDetails = calendarDetails;

  // console.log(learner_breakout);
  const updatedLearnerBreakout = await LearnerBreakout.update(
    {
      review_feedback,
    },
    {
      where: {
        id: learner_breakout_id,
      },
      returning: true,
      raw: true,
    },
  );
  return updatedLearnerBreakout;
};

export const createCalendarEventsForLearner = async (learnerId) => {
  let payload;
  let oauth;
  try {
    payload = await getPayloadForCalendar(learnerId);
    oauth = await getGoogleOauthOfUser(learnerId);
  } catch (err) {
    logger.error('Error at payload or oauth');
    logger.error(err);
    return false;
  }
  if (!payload) {
    logger.error('Error in calendar payload');
    return false;
  }
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
            // console.error(err);
            callback(err);
          }))
        .catch(err => {
          callback(err);
        });
    } else {
      callback();
    }
  })
    .then(() => res_data)
    .catch(err => {
      console.error(err);
      return false;
    });
};

/**
 * Update or creates a calendar event when cohortBreakout is updated.
 */
export const updateCalendarEventInLearnerBreakout = async (cohort_breakout_id) => {
  const cohort_breakout = await CohortBreakout
    .findByPk(cohort_breakout_id)
    .then(_cb => _cb.get({ plain: true }));

  const { cohort_id } = cohort_breakout;

  const cohort = await Cohort
    .findByPk(cohort_id)
    .then(_cohort => _cohort.get({ plain: true }));
  const { learners } = cohort;
  const calendarPayload = await getCalendarDetailsOfCohortBreakout(cohort_breakout_id);
  const payload = await Promise.all(learners.map(async learner => {
    const googleOauth = await getGoogleOauthOfUser(learner);
    // delete previously created calendar events.
    await LearnerBreakout
      .findByPk(learner)
      .then(_lb => _lb.get({ plain: true }))
      .then(async lb => {
        if (typeof lb.review_feeback.calendarDetails !== 'undefined') {
          await deleteEvent(googleOauth, lb.review_feedback.calendarDetails.id);
        }
      })
      .catch(err => {
        logger.error(err);
      });
    return {
      learner,
      googleOauth,
    };
  }));
  const res_data = [];
  return async.eachSeries(payload, (item, callback) => {
    createEvent(item.googleOauth, calendarPayload)
      .then(event => {
        let data = {
          learner: item.learner,
          event,
        };
        res_data.push(data);
        return data;
      })
      .then(_data => updateReviewFeedback(_data.learner, _data.event)
        .then(() => callback())
        .catch(err => callback(err)))
      .catch(err => {
        logger.error(err);
        callback(err);
      });
  })
    .then(() => res_data)
    .catch(err => {
      logger.error(err);
      return false;
    });
};

export const createLearnerBreakoutsForCurrentMS = async (learner_id,
  cohort_breakouts) => LearnerBreakout.bulkCreate(cohort_breakouts.map(cohort_breakout => ({
  id: uuid(),
  cohort_breakout_id: cohort_breakout.id,
  learner_id,
  attendance: false,
})));

export const createAllLearnerBreakoutsForCurrentMS = async (learners,
  cohort_breakouts) => {
  let learnerBreakout = await LearnerBreakout.findOne({
    where: {
      learner_id: learners[0],
      cohort_breakout_id: cohort_breakouts[0].id,
    },
    raw: true,
  });
  if (_.isEmpty(learnerBreakout)) {
    return learners.map(
      learner_id => LearnerBreakout.bulkCreate(cohort_breakouts.map(cohort_breakout => ({
        id: uuid(),
        cohort_breakout_id: cohort_breakout.id,
        learner_id,
        attendance: false,
      }
      ))),
    );
  }
  return LearnerBreakout;
};

export default LearnerBreakout;
