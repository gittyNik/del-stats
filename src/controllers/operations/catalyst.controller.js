import uuid from 'uuid/v4';
import moment from 'moment';
import { Op } from 'sequelize';
import { USER_ROLES, User } from '../../models/user';
import { CohortBreakout } from '../../models/cohort_breakout';

// eslint-disable-next-line import/prefer-default-export
export const addCatalyst = (req, res) => {
  const { name, email, phone } = req.body;
  User.create({
    id: uuid(),
    name,
    email,
    phone,
    role: USER_ROLES.CATALYST,
    roles: [USER_ROLES.CATALYST],
  })
    .then(data => res.json({
      text: 'Catalyst added',
      data,
    }))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

export const completedBreakoutsByCatalyst = (
  {
    catalyst_id,
  },
) => CohortBreakout.findAll({
  where: {
    catalyst_id,
    status: 'completed',
  },
  raw: true,
});

export const cumulativeTimeTaken = async (req, res) => {
  const catalyst_id = req.params.id ? req.params.id : req.jwtData.user.id;

  try {
    const today = await CohortBreakout.sum('time_taken_by_catalyst', { where: { catalyst_id, time_started: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } });
    const thisWeek = await CohortBreakout.sum('time_taken_by_catalyst', { where: { catalyst_id, time_started: { [Op.gte]: moment().startOf('week').toDate() } } });
    const thisMonth = await CohortBreakout.sum('time_taken_by_catalyst', { where: { catalyst_id, time_started: { [Op.gte]: moment().startOf('month').toDate() } } });
    const overall = await CohortBreakout.sum('time_taken_by_catalyst', { where: { catalyst_id } });

    res.json({
      message: 'Catalyst added',
      type: 'Success',
      data: {
        today, thisWeek, thisMonth, overall,
      },
    });
  } catch (err) {
    res.json({
      message: err.message,
      type: 'Failure',
      data: err,
    });
  }
};

export const sessionsStartedOnTime = async (req, res) => {
  const catalyst_id = req.params.id ? req.params.id : req.jwtData.user.id;
  CohortBreakout.count({ where: { catalyst_id, time_started: { [Op.lte]: 'time_scheduled' } } })
    .then(data => res.json({
      message: `Count of Sessions started on time is ${data}`,
      type: 'Success',
      data,
    }))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};
