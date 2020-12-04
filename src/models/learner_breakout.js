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
  getMilestoneDetailsForReview,
} from './cohort_breakout';

import { createEvent, deleteEvent } from '../integrations/calendar/calendar.model';
import { getUserName } from './user';
import { getGoogleOauthOfUser } from '../util/calendar-util';
import logger from '../util/logger';

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
//   // logger.info(learner_breakout);
//   const { cohort_breakout_id, learner_id } = learner_breakout_raw;
//   try {
//     const event_body = await getCalendarDetailsOfCohortBreakout(cohort_breakout_id);
//     // logger.info(event_body);
//     const oauth2 = await getGoogleOauthOfUser(learner_id);
//     const calendarEvent = await createEvent(oauth2, event_body);

//     learner_breakout.review_feedback = { calendarEvent };
//   } catch (err) {
//     logger.error(err);
//   }
// });

// LearnerBreakout.addHook('afterUpdate', 'updateCalendarEvent',
// async (learner_breakout, options) => {
//   logger.info('Learner Breakout updated');
//   logger.info(learner_breakout.get({ plain: true }));
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
      // logger.info(learner, cohort_breakout_id);
      let learnerBreakout = LearnerBreakout.create({
        id: uuid(),
        cohort_breakout_id,
        learner_id: learner,
        attendance: false,
      })
        .then((data) => data.get({ plain: true }))
        .catch((err) => {
          logger.error(err);
          return null;
        });
      return learnerBreakout;
    });
    // logger.info(
    //   `${learnerBreakouts.length} learner_breakouts created
    // for a cohort_breakout_id: ${ cohort_breakout_id }`,
    // );
    return learnerBreakouts;
  })
  .catch((err) => {
    logger.error(err);
    return null;
  });

export const createLearnerBreakoutsForLearners = (
  cohort_breakout_id,
  learners,
) => learners.map((learner) => {
  // logger.info(learner, cohort_breakout_id);
  let learnerBreakout = LearnerBreakout.create({
    id: uuid(),
    cohort_breakout_id,
    learner_id: learner,
    attendance: false,
  })
    .then((data) => data.get({ plain: true }))
    .catch((err) => {
      logger.error(err);
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
    // logger.info(cohort_id);
    const cohortBreakouts = await getUpcomingBreakoutsByCohortId(cohort_id);
    // logger.info(cohortBreakouts.length);
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
            logger.error(`No learner breakout for ${cohortBreakout.id}`);
            return false;
          });
        return data;
      }),
    );
    // logger.info(payload);
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
      logger.error('Learner breakout doesnt exist');
      logger.error(err);
    });
  const review_feedback = learner_breakout.review_feeback
    ? learner_breakout.review_feedback
    : {};
  review_feedback.calendarDetails = calendarDetails;

  // logger.info(learner_breakout);
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
          // logger.info(item);
          return item;
        })
        .then(_item => updateReviewFeedback(_item.learnerBreakout.id, _item.eventDetails)
          .then((data) => {
            // logger.info(data);
            callback();
          })
          .catch(err => {
            // logger.error(err);
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
      logger.error(err);
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

export const createAllLearnerBreakout = async (learners,
  cohort_breakout_id) => {
  let learnerBreakouts = await LearnerBreakout.bulkCreate(learners.map(learner_id => ({
    id: uuid(),
    cohort_breakout_id,
    learner_id,
    attendance: false,
  }
  )));
  const userBreakouts = async (lBreakout) => {
    let userDetails = await getUserName(lBreakout.learner_id);
    lBreakout.user = userDetails;
    return lBreakout;
  };
  return Promise.all(learnerBreakouts.map(
    learnerBreakout => userBreakouts(learnerBreakout.get({ plain: true })),
  ));
};

export const createAllLearnerBreakoutsForCurrentMS = async (learners,
  cohort_breakouts) => {
  if (learners && learners.length > 0) {
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
  return null;
};

export const getLearnerBreakoutsForACohortBreakout = (cohort_breakout_id) => LearnerBreakout
  .findAll({
    where: {
      cohort_breakout_id,
    },
    raw: true,
  });

export const getReviewRubricForALearner = async (learner_id, limit = 10) => {
  const allRubrics = [];
  return LearnerBreakout.findAll({
    attributes: ['id', 'cohort_breakout_id', 'review_feedback'],
    where: {
      learner_id,
      // eslint-disable-next-line quotes
      [Sequelize.Op.and]: Sequelize.literal(`review_feedback->>'type' = 'reviews' AND review_feedback->>'rubrics' IS NOT NULL`),
    },
    // limit,
    raw: true,
  })
    .then(lbs => Promise.all(lbs.map(async lb => {
      const ms_details = await getMilestoneDetailsForReview(lb.cohort_breakout_id);
      lb.milestone_name = ms_details.name;
      lb.milestone_id = ms_details.id;
      lb.learner_breakout_id = lb.id;
      lb.rubrics = lb.review_feedback.rubrics;
      allRubrics.push(...Object.keys(lb.rubrics).map(i => lb.rubrics[i]));
      // rf.review_feedback.rubrics
      delete lb.id;
      delete lb.cohort_breakout_id;
      delete lb.review_feedback;
      return lb;
    })))
    .then(_lb => ({
      milestone_rubrics: _lb,
      top10Rubrics: allRubrics
        .sort((a, b) => ((a.score >= b.score) ? -1 : 1))
        .filter((rubric, index, self) => index === self.findIndex(r => r.rubric_name === rubric.rubric_name))
        .slice(0, limit),
    }))
    .catch(err => {
      logger.error(err);
      logger.info('Error in fetching reviewRubricForALearner', learner_id);
      return false;
    });
};

export default LearnerBreakout;
